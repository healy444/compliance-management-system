import { Table, Button, Space, message, Typography, Empty, Modal, Form, Input, Spin, Drawer, Descriptions, Tag, Tooltip, Tabs } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requirementService, uploadService } from '../services/apiService';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import './ApprovalsPage.css';

const { Title } = Typography;

const ApprovalsPage = () => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm<{ remarks?: string }>();
    const [modalOpen, setModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [activeId, setActiveId] = useState<number | null>(null);
    const [activeRequirementName, setActiveRequirementName] = useState<string>('');
    const [detailRequirementId, setDetailRequirementId] = useState<number | null>(null);
    const { data: uploads, isLoading } = useQuery({
        queryKey: ['uploads'],
        queryFn: uploadService.getAll,
    });
    const { data: requirementDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['requirement-detail', detailRequirementId],
        queryFn: () => requirementService.show(detailRequirementId as number),
        enabled: Boolean(detailRequirementId),
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, remarks }: { id: number, remarks: string }) => uploadService.approve(id, remarks),
        onSuccess: () => {
            message.success(activeRequirementName ? `Approved: ${activeRequirementName}` : 'Approved successfully');
            queryClient.invalidateQueries({ queryKey: ['uploads'] });
            setModalOpen(false);
            setActiveId(null);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to approve.');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, remarks }: { id: number, remarks: string }) => uploadService.reject(id, remarks),
        onSuccess: () => {
            message.success(activeRequirementName ? `Rejected: ${activeRequirementName}` : 'Rejected successfully');
            queryClient.invalidateQueries({ queryKey: ['uploads'] });
            setModalOpen(false);
            setActiveId(null);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to reject.');
        },
    });

    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    const filteredUploads = (uploads || []).filter((upload: any) => {
        if (statusFilter === 'all') {
            return true;
        }
        return String(upload.approval_status || '').toUpperCase() === statusFilter.toUpperCase();
    });

    const handleViewFile = async (uploadId: number) => {
        try {
            const { url } = await uploadService.getSignedUrl(uploadId, true);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to open file.');
        }
    };

    const openDetails = (requirementId?: number | null) => {
        if (!requirementId) {
            message.warning('Requirement details not available.');
            return;
        }
        setDetailRequirementId(requirementId);
        setDetailOpen(true);
    };

    const openRemarks = (type: 'approve' | 'reject', id: number, requirementName?: string) => {
        setActionType(type);
        setActiveId(id);
        setActiveRequirementName(requirementName || '');
        form.resetFields();
        setModalOpen(true);
    };

    const handleSubmit = (values: { remarks?: string }) => {
        if (!activeId) {
            return;
        }
        if (actionType === 'approve') {
            approveMutation.mutate({ id: activeId, remarks: values.remarks || '' });
        } else {
            rejectMutation.mutate({ id: activeId, remarks: values.remarks || '' });
        }
    };

    const isProcessing = approveMutation.isPending || rejectMutation.isPending;

    const columns: ColumnsType<any> = [
        {
            title: 'Requirement',
            key: 'requirement',
            render: (_, record) => (
                    <div className="approvals-meta">
                        <div className="approvals-meta-title">{record.requirement?.requirement}</div>
                        <div className="approvals-meta-subtitle">{record.requirement?.agency?.name}</div>
                    </div>
                ),
            },
        {
            title: 'PIC',
            key: 'pic',
            render: (_, record) => (
                <div className="approvals-meta">
                    <div>{record.uploader?.employee_name}</div>
                    <div className="approvals-meta-subtitle">{record.uploader?.branch}</div>
                </div>
            ),
        },
        {
            title: 'Submitted At',
            dataIndex: 'upload_date',
            key: 'submitted',
            render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'approval_status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'APPROVED'
                        ? 'green'
                        : status === 'REJECTED'
                            ? 'red'
                            : 'gold'
                }>
                    {status || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Status Date',
            dataIndex: 'status_change_on',
            key: 'status_change_on',
            render: (date, record) => {
                if (!record?.approval_status || record.approval_status === 'PENDING') {
                    return 'N/A';
                }
                return date ? new Date(date).toLocaleString() : 'N/A';
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View file">
                        <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewFile(record.id)}>
                            View File
                        </Button>
                    </Tooltip>
                    <Tooltip title="View requirement details">
                        <Button
                            type="text"
                            icon={<InfoCircleOutlined />}
                            onClick={() => openDetails(record.requirement?.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Approve">
                        <Button
                            type="text"
                            icon={<CheckOutlined />}
                            className="approvals-action approvals-action--approve"
                            onClick={() => openRemarks('approve', record.id, record.requirement?.requirement)}
                            loading={isProcessing && activeId === record.id && actionType === 'approve'}
                            disabled={isProcessing || record.approval_status !== 'PENDING'}
                        />
                    </Tooltip>
                    <Tooltip title="Reject">
                        <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => openRemarks('reject', record.id, record.requirement?.requirement)}
                            loading={isProcessing && activeId === record.id && actionType === 'reject'}
                            disabled={isProcessing || record.approval_status !== 'PENDING'}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="approvals-page">
            <Title level={2} className="approvals-title">Approvals</Title>
            <Tabs
                activeKey={statusFilter}
                onChange={(key) => setStatusFilter(key as typeof statusFilter)}
                items={[
                    { key: 'pending', label: 'Pending' },
                    { key: 'approved', label: 'Approved' },
                    { key: 'rejected', label: 'Rejected' },
                    { key: 'all', label: 'All' },
                ]}
            />
            <Table
                columns={columns}
                dataSource={filteredUploads}
                rowKey="id"
                loading={isLoading}
                locale={{ emptyText: <Empty description="No pending approvals" /> }}
            />
            <Modal
                title={(
                    <Space>
                        {actionType === 'approve' ? 'Approve submission' : 'Reject submission'}
                        {isProcessing ? <Spin size="small" /> : null}
                    </Space>
                )}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                destroyOnClose
                className="approvals-modal"
                footer={(
                    <div className="approvals-modal-footer">
                        <Space>
                            <Button onClick={() => setModalOpen(false)} disabled={isProcessing}>Cancel</Button>
                            <Button
                                type="primary"
                                danger={actionType === 'reject'}
                                onClick={() => form.submit()}
                                loading={isProcessing}
                            >
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                        </Space>
                    </div>
                )}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Remarks"
                        name="remarks"
                        rules={actionType === 'reject' ? [{ required: true, message: 'Remarks are required to reject.' }] : []}
                    >
                        <Input.TextArea rows={4} placeholder="Add remarks (optional for approvals)" />
                    </Form.Item>
                </Form>
            </Modal>
            <Drawer
                title="Requirement Details"
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                width={760}
                destroyOnClose
                className="approvals-detail-drawer"
            >
                {detailLoading ? (
                    <Spin />
                ) : (
                    <>
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="Requirement ID">
                                {requirementDetail?.req_id || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Agency">
                                {requirementDetail?.agency?.name || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Category">
                                {requirementDetail?.category || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Requirement Name" span={2}>
                                {requirementDetail?.requirement || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>
                                {requirementDetail?.description || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Frequency">
                                {requirementDetail?.frequency || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Schedule">
                                {requirementDetail?.schedule || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Deadline">
                                {requirementDetail?.deadline || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Overall Compliance Status">
                                {requirementDetail?.compliance_status || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                        <div className="approvals-detail-section">
                            <Typography.Title level={5}>Past Uploads</Typography.Title>
                            {requirementDetail?.uploads && requirementDetail.uploads.length > 0 ? (
                                <Space direction="vertical" size={12} className="approvals-upload-list">
                                    {requirementDetail.uploads.map((upload: any) => (
                                        <div key={upload.id} className="approvals-upload-item">
                                            <div className="approvals-upload-row">
                                                <div>
                                                    <div className="approvals-upload-title">{upload.upload_id}</div>
                                                    <div className="approvals-upload-subtitle">
                                                        {upload.uploader?.employee_name || upload.uploader_email || 'Unknown'} ·{' '}
                                                        {upload.upload_date ? new Date(upload.upload_date).toLocaleString() : 'N/A'}
                                                    </div>
                                                </div>
                                                <Tag color={
                                                    upload.approval_status === 'APPROVED'
                                                        ? 'green'
                                                        : upload.approval_status === 'REJECTED'
                                                            ? 'red'
                                                            : 'gold'
                                                }>
                                                    {upload.approval_status}
                                                </Tag>
                                            </div>
                                            <Space>
                                                <Button size="small" onClick={() => handleViewFile(upload.id)}>
                                                    View file
                                                </Button>
                                                {upload.admin_remarks ? (
                                                    <span className="approvals-upload-remarks">
                                                        Remarks: {upload.admin_remarks}
                                                    </span>
                                                ) : null}
                                            </Space>
                                        </div>
                                    ))}
                                </Space>
                            ) : (
                                <Empty description="No uploads found" />
                            )}
                        </div>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default ApprovalsPage;
