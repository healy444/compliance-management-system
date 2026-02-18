import { Card, Row, Col, Statistic, Progress, Typography as AntTypography, Space } from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    BankOutlined,
    PieChartOutlined,
    BarChartOutlined,
    FileProtectOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/apiService';
import { authService } from '../services/authService';
import { getAccessLevel } from '../lib/access';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const { Text, Title } = AntTypography;

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
    const showKpis = accessLevel !== 'pic';

    const { data: agencyStats, isLoading: agencyLoading } = useQuery({
        queryKey: ['agency-stats'],
        queryFn: dashboardService.getAgencyStats,
    });

    const kpiCards = [
        { title: 'Total Agencies', value: stats?.total_agencies || 0, icon: <BankOutlined />, colorClass: 'dashboard-stat--blue', to: '/agencies' },
        { title: 'Total Requirements', value: stats?.total_requirements || 0, icon: <FileTextOutlined />, colorClass: 'dashboard-stat--blue', to: '/requirements' },
        { title: 'Compliant', value: stats?.compliant || 0, icon: <CheckCircleOutlined />, colorClass: 'dashboard-stat--green', to: '/requirements?status=compliant' },
        { title: 'Pending', value: stats?.pending || 0, icon: <ClockCircleOutlined />, colorClass: 'dashboard-stat--gold', to: '/requirements?status=pending' },
        { title: 'Overdue', value: stats?.overdue || 0, icon: <WarningOutlined />, colorClass: 'dashboard-stat--red', to: '/requirements?status=overdue' },
        { title: 'For Approval', value: stats?.for_approval || 0, icon: <FileProtectOutlined />, colorClass: 'dashboard-stat--purple', to: '/uploads' },
    ];

    return (
        <div className="dashboard-page">
            <h2 className="dashboard-title">Dashboard</h2>

            {showKpis ? (
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
            ) : null}

            <Row gutter={[16, 16]} className="dashboard-row">
                <Col xs={24} lg={12}>
                    <Card title="Compliance Rate" loading={statsLoading} variant="outlined">
                        <div className="dashboard-center">
                            <Progress
                                type="circle"
                                percent={stats?.compliance_rate || 0}
                                format={percent => `${percent}%`}
                                strokeColor="#52c41a"
                                size={200}
                            />
                            <p className="dashboard-muted">Overall compliance rate</p>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Title level={4} className="dashboard-section-title">Reports Snapshot</Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card title={<Space><PieChartOutlined /> Compliance by Agency</Space>} loading={agencyLoading} variant="outlined">
                        {(agencyStats || []).map((agency) => (
                            <div key={agency.agency} className="reports-row">
                                <div className="reports-row-header">
                                    <Text strong>{agency.agency}</Text>
                                    <Text type="secondary">{agency.rate}%</Text>
                                </div>
                                <Progress percent={agency.rate} showInfo={false} strokeColor="#1890ff" />
                            </div>
                        ))}
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title={<Space><BarChartOutlined /> Submission Trends</Space>} variant="outlined">
                        <div className="reports-bars">
                            {[40, 65, 30, 85, 45, 90, 70].map((height, i) => (
                                <div key={i} className="reports-bar-col">
                                    <div
                                        className={`reports-bar reports-bar--${i}`}
                                        style={{ height: `${height}%` }}
                                    />
                                    <Text type="secondary" className="reports-bar-label">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} className="reports-row-gap">
                <Col xs={24} lg={8}>
                    <Card className="reports-hero" loading={statsLoading} variant="outlined">
                        <FileProtectOutlined className="reports-hero-icon" />
                        <div className="reports-hero-label">Global Compliance Rate</div>
                        <div className="reports-hero-value">{stats?.compliance_rate || 0}%</div>
                        <div className="reports-hero-subtitle">Based on latest assignments</div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card loading={statsLoading} variant="outlined">
                        <Title level={5}>Compliance Status Breakdown</Title>
                        <Text type="secondary">Compliant vs Remaining</Text>
                        <Row className="reports-distribution">
                            <Col span={12} className="reports-distribution-col reports-distribution-col--border">
                                <Statistic title="Compliant" value={stats?.compliant || 0} className="reports-stat reports-stat--blue" />
                            </Col>
                            <Col span={12} className="reports-distribution-col">
                                <Statistic title="Pending" value={stats?.pending || 0} className="reports-stat reports-stat--purple" />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card loading={statsLoading} variant="outlined">
                        <div className="reports-critical">
                            <WarningOutlined className="reports-critical-icon" />
                            <Title level={5} className="reports-critical-title">Overdue Requirements</Title>
                        </div>
                        <div className="dashboard-center" style={{ padding: '20px 0' }}>
                            <Statistic
                                value={stats?.overdue || 0}
                                suffix="Requirements"
                                styles={{ content: { color: '#ff4d4f' } }}
                            />
                            <Text type="secondary">Action required for compliance</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
