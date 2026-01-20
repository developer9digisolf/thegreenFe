import React, { useEffect, useState } from 'react'
import MainLayout from '@afx/views/base/main.layout'
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { ServiceCategoryGetAllService, ServiceCategoryCreateService, ServiceCategoryUpdateService, ServiceCategoryDeleteService } from '@afx/services/service-category.service'
import { IServiceCategory } from '@afx/interfaces/service-category.iface'

export default function MasterServiceCategory() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<IServiceCategory[]>([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form] = Form.useForm()

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true)
        try {
            const res = await ServiceCategoryGetAllService({ page, pageSize })
            if (res.success) {
                setData(res.data)
                setPagination({
                    current: res.pagination.currentPage,
                    pageSize: res.pagination.pageSize,
                    total: res.pagination.total
                })
            }
        } catch (err: any) {
            message.error(err.message || 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleTableChange = (pag: any) => {
        fetchData(pag.current, pag.pageSize)
    }

    const handleCreate = () => {
        setEditingId(null)
        form.resetFields()
        // Default color
        form.setFieldsValue({ sortOrder: 0, color: '#1677ff', isActive: true })
        setIsModalOpen(true)
    }

    const handleEdit = (record: IServiceCategory) => {
        setEditingId(record.id)
        form.setFieldsValue(record)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await ServiceCategoryDeleteService(id)
            if (res.success) {
                message.success('Category deleted successfully')
                fetchData(pagination.current, pagination.pageSize)
            }
        } catch (err: any) {
            message.error(err.message || 'Failed to delete')
        }
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (editingId) {
                await ServiceCategoryUpdateService(editingId, values)
                message.success('Category updated successfully')
            } else {
                await ServiceCategoryCreateService(values)
                message.success('Category created successfully')
            }
            setIsModalOpen(false)
            fetchData(pagination.current, pagination.pageSize)
        } catch (err: any) {
            if (err.errorFields) return
            message.error(err.message || 'Operation failed')
        }
    }

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Icon', dataIndex: 'icon', key: 'icon', render: (text: string) => text ? <i className={text}></i> : '-' },
        { title: 'Color', dataIndex: 'color', key: 'color', render: (color: string) => <div style={{ width: 24, height: 24, background: color, borderRadius: 4, border: '1px solid #d9d9d9' }}></div> },
        { title: 'Order', dataIndex: 'sortOrder', key: 'sortOrder' },
        { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => active ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: IServiceCategory) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <MainLayout>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Service Categories Management</h2>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Category
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    rowKey="id"
                />

                <Modal
                    title={editingId ? "Edit Category" : "Add Category"}
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={() => setIsModalOpen(false)}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item name="icon" label="Icon Class (FontAwesome)">
                            <Input placeholder="fa-solid fa-spa" />
                        </Form.Item>
                        <Form.Item name="color" label="Color">
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Input type="color" style={{ width: 50, padding: 0, height: 32 }} />
                                <Form.Item name="color" noStyle><Input style={{ flex: 1 }} /></Form.Item>
                            </div>
                        </Form.Item>
                        <Form.Item name="sortOrder" label="Sort Order">
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </MainLayout>
    )
}
