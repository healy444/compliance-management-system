import { Card, Row, Col, Statistic, Typography as AntTypography, Space, Calendar, List, Modal, Button, Empty, Tag, Select } from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    BankOutlined,
    BarChartOutlined,
    FileProtectOutlined,
    CalendarOutlined,
    LeftOutlined,
    RightOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, requirementService, uploadService } from '../services/apiService';
import { authService } from '../services/authService';
import { getAccessLevel } from '../lib/access';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import './Dashboard.css';

const { Text } = AntTypography;

const Dashboard = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardService.getStats,
    });

    const { data: meData } = useQuery({
        queryKey: ['me'],
        queryFn: authService.me,
    });

    const accessLevel = getAccessLevel(meData?.user?.roles || []);
    const isPic = accessLevel === 'pic';

    const { data: agencyStats, isLoading: agencyLoading } = useQuery({
        queryKey: ['agency-stats'],
        queryFn: dashboardService.getAgencyStats,
    });

    const { data: calendarData } = useQuery({
        queryKey: ['dashboard-calendar'],
        queryFn: dashboardService.getCalendar,
    });

    const { data: licenseRequirements, isLoading: licenseLoading } = useQuery({
        queryKey: ['requirements', 'license-dashboard'],
        queryFn: () => requirementService.getAll({ category: 'License', per_page: 200 }),
    });

    const { data: permitRequirements, isLoading: permitLoading } = useQuery({
        queryKey: ['requirements', 'permit-dashboard'],
        queryFn: () => requirementService.getAll({ category: 'Permit', per_page: 200 }),
    });

    const { data: certificationRequirements, isLoading: certificationLoading } = useQuery({
        queryKey: ['requirements', 'certification-dashboard'],
        queryFn: () => requirementService.getAll({ category: 'Certification', per_page: 200 }),
    });

    const { data: myRequirements, isLoading: myRequirementsLoading } = useQuery({
        queryKey: ['requirements', 'my'],
        queryFn: requirementService.getMine,
        enabled: Boolean(meData) && isPic,
    });

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailRequirementId, setDetailRequirementId] = useState<number | null>(null);
    const [dateModalOpen, setDateModalOpen] = useState(false);
    const [selectedDateLabel, setSelectedDateLabel] = useState('');
    const [selectedDateItems, setSelectedDateItems] = useState<Array<{ id: number; name: string; status: string; pic?: string }>>([]);

    const { data: requirementDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['requirement-detail', detailRequirementId],
        queryFn: () => requirementService.show(detailRequirementId as number),
        enabled: Boolean(detailRequirementId),
    });

    const combinedRequirements = useMemo(() => {
        const list = [
            ...(licenseRequirements?.data || []),
            ...(permitRequirements?.data || []),
            ...(certificationRequirements?.data || []),
        ];
        return list.sort((a, b) => String(a.requirement || '').localeCompare(String(b.requirement || ''), undefined, { sensitivity: 'base' }));
    }, [licenseRequirements, permitRequirements, certificationRequirements]);

    const statusLegend = [
        { key: 'pending', label: 'Pending', className: 'status-pending' },
        { key: 'complied', label: 'Complied', className: 'status-complied' },
        { key: 'na', label: 'N/A', className: 'status-na' },
        { key: 'overdue', label: 'Overdue', className: 'status-overdue' },
    ];

    const calendarLegend = useMemo(() => {
        if (isPic) {
            return [
                { key: 'pending', label: 'Pending', className: 'status-pending' },
                { key: 'for_approval', label: 'Awaiting Approval', className: 'status-approval' },
                { key: 'complied', label: 'Complied', className: 'status-complied' },
                { key: 'overdue', label: 'Overdue', className: 'status-overdue' },
            ];
        }
        return [
            { key: 'pending', label: 'Pending', className: 'status-pending' },
            { key: 'complied', label: 'Complied', className: 'status-complied' },
            { key: 'na', label: 'N/A', className: 'status-na' },
            { key: 'overdue', label: 'Overdue', className: 'status-overdue' },
            { key: 'for_approval', label: 'For Approval', className: 'status-approval' },
        ];
    }, [isPic]);

    const calendarMap = useMemo(() => calendarData || {}, [calendarData]);

    const normalizeStatus = (value?: string | null) => {
        const text = (value || '').toLowerCase();
        if (!text || text === 'n/a' || text === 'na') {
            return 'na';
        }
        if (text.includes('late') || text.includes('overdue')) {
            return 'overdue';
        }
        if (text.includes('complied')) {
            return 'complied';
        }
        if (text.includes('pending')) {
            return 'pending';
        }
        return 'na';
    };

    const statusClass = (status: string) => {
        if (status === 'for_approval') {
            return 'status-approval';
        }
        return `status-${status}`;
    };

    const latestUpload = useMemo(() => {
        const uploads = requirementDetail?.uploads || [];
        if (!uploads.length) {
            return null;
        }
        return uploads
            .slice()
            .sort((a: any, b: any) => {
                const aTime = new Date(a.upload_date || a.created_at || 0).getTime();
                const bTime = new Date(b.upload_date || b.created_at || 0).getTime();
                return bTime - aTime;
            })[0];
    }, [requirementDetail]);

    const handleOpenDetail = (id: number) => {
        setDetailRequirementId(id);
        setDetailOpen(true);
    };

    const handleViewFile = async (uploadId: number) => {
        try {
            const { url } = await uploadService.getSignedUrl(uploadId, true);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            // noop: use a simple fallback to avoid noisy dashboard errors
        }
    };

    const kpiCards = [
        { title: 'Total Agencies', value: stats?.total_agencies || 0, icon: <BankOutlined />, colorClass: 'dashboard-stat--blue', to: '/agencies' },
        { title: 'Total Requirements', value: stats?.total_requirements || 0, icon: <FileTextOutlined />, colorClass: 'dashboard-stat--blue', to: '/requirements' },
        { title: 'Compliant', value: stats?.compliant || 0, icon: <CheckCircleOutlined />, colorClass: 'dashboard-stat--green', to: '/requirements?status=compliant' },
        { title: 'Pending', value: stats?.pending || 0, icon: <ClockCircleOutlined />, colorClass: 'dashboard-stat--gold', to: '/requirements?status=pending' },
        { title: 'Overdue', value: stats?.overdue || 0, icon: <WarningOutlined />, colorClass: 'dashboard-stat--red', to: '/requirements?status=overdue' },
        { title: 'For Approval', value: stats?.for_approval || 0, icon: <FileProtectOutlined />, colorClass: 'dashboard-stat--purple', to: '/uploads' },
    ];

    const picStats = useMemo(() => {
        const list = myRequirements || [];
        let pending = 0;
        let awaitingApproval = 0;
        let overdue = 0;
        let complied = 0;

        list.forEach((req) => {
            const status = String(req.compliance_status || '').toUpperCase();
            if (status === 'APPROVED') {
                complied += 1;
            } else if (status === 'OVERDUE') {
                overdue += 1;
            } else if (status === 'SUBMITTED') {
                awaitingApproval += 1;
            } else if (status === 'PENDING' || status === 'REJECTED') {
                pending += 1;
            }
        });

        return {
            totalAssigned: list.length,
            pending,
            awaitingApproval,
            overdue,
            complied,
        };
    }, [myRequirements]);

    const picKpiCards = [
        { title: 'Total Requirements', value: picStats.totalAssigned, icon: <FileTextOutlined />, colorClass: 'dashboard-stat--blue' },
        { title: 'Pending', value: picStats.pending, icon: <ClockCircleOutlined />, colorClass: 'dashboard-stat--gold' },
        { title: 'Awaiting Approval', value: picStats.awaitingApproval, icon: <FileProtectOutlined />, colorClass: 'dashboard-stat--purple' },
        { title: 'Overdue', value: picStats.overdue, icon: <WarningOutlined />, colorClass: 'dashboard-stat--red' },
        { title: 'Complied', value: picStats.complied, icon: <CheckCircleOutlined />, colorClass: 'dashboard-stat--green' },
    ];

    return (
        <div className="dashboard-page">
            {isPic ? (
                <Row gutter={[16, 16]} className="dashboard-kpi-row dashboard-kpi-row--pic" justify="space-between">
                    {picKpiCards.map((stat, index) => (
                        <Col xs={24} sm={12} md={8} key={index} flex="1 1 220px">
                            <Card
                                className={`dashboard-stat dashboard-kpi-card dashboard-kpi-card--static ${stat.colorClass}`}
                                loading={myRequirementsLoading}
                                variant="outlined"
                            >
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    prefix={<span className="dashboard-stat-icon">{stat.icon}</span>}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Row gutter={[16, 16]} className="dashboard-kpi-row">
                    {kpiCards.map((stat, index) => (
                        <Col xs={24} sm={12} md={8} lg={4} key={index}>
                            <Card
                                className={`dashboard-stat dashboard-kpi-card ${stat.colorClass}`}
                                loading={statsLoading}
                                variant="outlined"
                                onClick={() => stat.to && navigate(stat.to)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && stat.to) {
                                        navigate(stat.to);
                                    }
                                }}
                            >
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    prefix={<span className="dashboard-stat-icon">{stat.icon}</span>}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Row gutter={[16, 16]} className="dashboard-row">
                <Col xs={24}>
                    <Card title={<Space><CalendarOutlined /> Calendar</Space>} variant="outlined">
                        <div className="dashboard-status-legend dashboard-status-legend--calendar">
                            {calendarLegend.map((item) => (
                                <div key={item.key} className="dashboard-status-legend-item">
                                    <span className={`dashboard-status-swatch ${item.className}`} />
                                    <Text type="secondary">{item.label}</Text>
                                </div>
                            ))}
                        </div>
                        <Calendar
                            fullscreen={false}
                            dateCellRender={(value) => {
                                const dateKey = value.format('YYYY-MM-DD');
                                const items = calendarMap[dateKey] || [];
                                if (!items.length) {
                                    return null;
                                }
                                const uniqueStatuses = Array.from(new Set(items.map((item) => item.status)));
                                const singleStatus = uniqueStatuses.length === 1 ? uniqueStatuses[0] : null;
                                const dots = items.slice(0, 4);
                                return (
                                    <div className={`dashboard-calendar-cell ${singleStatus ? statusClass(singleStatus) : ''}`}>
                                        <div className="dashboard-calendar-dots">
                                            {dots.map((item) => (
                                                <span key={item.id} className={`dashboard-calendar-dot ${statusClass(item.status)}`} />
                                            ))}
                                            {items.length > 4 ? (
                                                <span className="dashboard-calendar-more">+{items.length - 4}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            }}
                            onSelect={(value) => {
                                const dateKey = value.format('YYYY-MM-DD');
                                setSelectedDateLabel(value.format('MMMM D, YYYY'));
                                setSelectedDateItems(calendarMap[dateKey] || []);
                                setDateModalOpen(true);
                            }}
                            headerRender={({ value, onChange }) => {
                                const year = value.year();
                                const month = value.month();
                                const years = Array.from({ length: 10 }, (_, i) => year - 5 + i);
                                const months = [
                                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                                ];
                                return (
                                    <div className="dashboard-calendar-header">
                                        <Button
                                            size="small"
                                            icon={<LeftOutlined />}
                                            onClick={() => onChange(value.clone().month(month - 1))}
                                            className="dashboard-calendar-nav"
                                        />
                                        <Select
                                            value={year}
                                            onChange={(newYear) => {
                                                const next = value.clone().year(newYear);
                                                onChange(next);
                                            }}
                                            options={years.map((y) => ({ value: y, label: y }))}
                                            className="dashboard-calendar-select"
                                        />
                                        <Select
                                            value={month}
                                            onChange={(newMonth) => {
                                                const next = value.clone().month(newMonth);
                                                onChange(next);
                                            }}
                                            options={months.map((label, idx) => ({ value: idx, label }))}
                                            className="dashboard-calendar-select"
                                        />
                                        <Button
                                            size="small"
                                            icon={<RightOutlined />}
                                            onClick={() => onChange(value.clone().month(month + 1))}
                                            className="dashboard-calendar-nav"
                                        />
                                    </div>
                                );
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="dashboard-row">
                <Col xs={24}>
                    <Card title={<Space><BarChartOutlined /> Compliance by Agency</Space>} loading={agencyLoading} variant="outlined">
                        <div className="dashboard-status-legend">
                            {statusLegend.map((item) => (
                                <div key={item.key} className="dashboard-status-legend-item">
                                    <span className={`dashboard-status-swatch ${item.className}`} />
                                    <Text type="secondary">{item.label}</Text>
                                </div>
                            ))}
                        </div>
                        {(agencyStats || []).length ? (
                            <div className="dashboard-agency-columns">
                                {(agencyStats || []).map((agency) => {
                                    const total = agency.total || 0;
                                    const segments = [
                                        { key: 'pending', value: agency.pending, className: 'status-pending' },
                                        { key: 'complied', value: agency.complied, className: 'status-complied' },
                                        { key: 'na', value: agency.na, className: 'status-na' },
                                        { key: 'overdue', value: agency.overdue, className: 'status-overdue' },
                                    ];
                                    return (
                                        <div key={agency.agency} className="dashboard-agency-column">
                                            <div className="dashboard-agency-stack">
                                                {segments.map((segment) => {
                                                    const percent = total > 0 ? (segment.value / total) * 100 : 0;
                                                    return (
                                                        <div
                                                            key={segment.key}
                                                            className={`dashboard-agency-segment ${segment.className}`}
                                                            style={{ height: `${percent}%` }}
                                                            title={`${segment.key}: ${segment.value}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div className="dashboard-agency-column-label">
                                                <Text
                                                    strong
                                                    className={`dashboard-agency-name ${String(agency.agency || '').length > 5 ? 'dashboard-agency-label--small' : ''}`}
                                                >
                                                    {agency.agency}
                                                </Text>
                                                <Text type="secondary">{total}</Text>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Empty description="No agency data" />
                        )}
                    </Card>
                </Col>
            </Row>

            {!isPic ? (
                <Row gutter={[16, 16]} className="dashboard-row">
                    <Col xs={24}>
                        <Card
                            title="Regulatory Requirements"
                            loading={licenseLoading || permitLoading || certificationLoading}
                            variant="outlined"
                        >
                            {combinedRequirements.length ? (
                                <List
                                    dataSource={combinedRequirements}
                                    renderItem={(item: any) => (
                                        <List.Item
                                            className="dashboard-req-item"
                                            actions={[
                                                <Button
                                                    key="view"
                                                    type="link"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => handleOpenDetail(item.id)}
                                                >
                                                    View latest upload
                                                </Button>,
                                            ]}
                                        >
                                        <List.Item.Meta
                                            title={item.requirement}
                                            description={(
                                                <Space wrap>
                                                    <Tag color="blue">{item.category}</Tag>
                                                    <Text type="secondary">{item.agency?.name || item.agency_id}</Text>
                                                    <Tag className={`dashboard-status-tag ${statusLegend.find(s => s.key === normalizeStatus(item.compliance_status))?.className || 'status-na'}`}>
                                                        {normalizeStatus(item.compliance_status).toUpperCase()}
                                                    </Tag>
                                                </Space>
                                            )}
                                        />
                                    </List.Item>
                                )}
                            />
                            ) : (
                                <Empty description="No license/permit requirements" />
                            )}
                        </Card>
                    </Col>
                </Row>
            ) : null}
            <Modal
                title="Latest Upload"
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                destroyOnClose
            >
                {detailLoading ? (
                    <div className="dashboard-modal-loading">Loading...</div>
                ) : latestUpload ? (
                    <div className="dashboard-latest-upload">
                        <div><Text strong>Requirement:</Text> {requirementDetail?.requirement}</div>
                        <div><Text strong>Upload ID:</Text> {latestUpload.upload_id}</div>
                        <div><Text strong>Uploaded By:</Text> {latestUpload.uploader?.employee_name || latestUpload.uploader_email || 'Unknown'}</div>
                        <div><Text strong>Uploaded At:</Text> {latestUpload.upload_date ? new Date(latestUpload.upload_date).toLocaleString() : 'N/A'}</div>
                        <div><Text strong>Status:</Text> {latestUpload.approval_status}</div>
                        <div className="dashboard-latest-upload-actions">
                            <Button type="primary" onClick={() => handleViewFile(latestUpload.id)}>
                                Open file
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Empty description="No uploads found" />
                )}
            </Modal>
            <Modal
                title={`Requirements due on ${selectedDateLabel}`}
                open={dateModalOpen}
                onCancel={() => setDateModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                {selectedDateItems.length ? (
                    <List
                        dataSource={selectedDateItems}
                        renderItem={(item) => (
                            <List.Item className="dashboard-date-item">
                                <List.Item.Meta
                                    title={item.name}
                                    description={(
                                        <Space wrap>
                                            <Tag className={`dashboard-status-tag ${statusClass(item.status)}`}>
                                                {item.status.replace('_', ' ').toUpperCase()}
                                            </Tag>
                                            <Text type="secondary">PIC: {item.pic || 'N/A'}</Text>
                                        </Space>
                                    )}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="No deadline set for this date" />
                )}
            </Modal>
        </div>
    );
};

export default Dashboard;
