import React, { useEffect, useState } from 'react'
import MainLayout from '@afx/views/base/main.layout'
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm, Tag, Switch } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { ServiceCategoryGetAllService, ServiceCategoryCreateService, ServiceCategoryUpdateService, ServiceCategoryDeleteService } from '@afx/services/service-category.service'
import { IServiceCategory } from '@afx/interfaces/service-category.iface'

export default function MasterServiceCategory() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<IServiceCategory[]>([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form] = Form.useForm()

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true)
        try {
            const res = await ServiceCategoryGetAllService({ page, pageSize })
            if (res.success) {
                setData(res.data)
                setPagination({
                    current: res.pagination?.currentPage || page,
                    pageSize: res.pagination?.pageSize || pageSize,
                    total: res.pagination?.total || 0
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
        form.setFieldsValue({ sortOrder: 0, color: '#1677ff', isActive: true })
        setIsModalOpen(true)
    }

    const handleEdit = (record: IServiceCategory) => {
        setEditingId(record.id)
        form.setFieldsValue(record)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
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
                const res = await ServiceCategoryUpdateService(editingId, values)
                if (res.success) {
                    message.success('Category updated successfully')
                }
            } else {
                const res = await ServiceCategoryCreateService(values)
                if (res.success) {
                    message.success('Category created successfully')
                }
            }
            setIsModalOpen(false)
            fetchData(pagination.current, pagination.pageSize)
        } catch (err: any) {
            if (err.errorFields) return
            message.error(err.message || 'Operation failed')
        }
    }

    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id',
            width: 80
        },
        { 
            title: 'Name', 
            dataIndex: 'name', 
            key: 'name' 
        },
        { 
            title: 'Description', 
            dataIndex: 'description', 
            key: 'description',
            ellipsis: true
        },
        { 
            title: 'Icon', 
            dataIndex: 'icon', 
            key: 'icon', 
            width: 80,
            render: (text: string) => text ? <i className={text}></i> : '-' 
        },
        { 
            title: 'Color', 
            dataIndex: 'color', 
            key: 'color', 
            width: 80,
            render: (color: string) => color ? (
                <div style={{ width: 24, height: 24, background: color, borderRadius: 4, border: '1px solid #d9d9d9' }}></div>
            ) : '-'
        },
        { 
            title: 'Order', 
            dataIndex: 'sortOrder', 
            key: 'sortOrder',
            width: 80
        },
        { 
            title: 'Services', 
            dataIndex: 'serviceCount', 
            key: 'serviceCount',
            width: 100,
            render: (count: number) => count || 0
        },
        { 
            title: 'Active', 
            dataIndex: 'isActive', 
            key: 'isActive',
            width: 80,
            render: (active: boolean) => active ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> 
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (_: any, record: IServiceCategory) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm 
                        title="Delete this category?" 
                        description="This will soft-delete the category."
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <MainLayout>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Service Categories Management</h2>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Category
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                    onChange={handleTableChange}
                    rowKey="id"
                    size="middle"
                />

                <Modal
                    title={editingId ? "Edit Category" : "Add Category"}
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={() => setIsModalOpen(false)}
                    width={500}
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item 
                            name="name" 
                            label="Name" 
                            rules={[
                                { required: true, message: 'Please enter category name' },
                                { max: 50, message: 'Name cannot exceed 50 characters' }
                            ]}
                        >
                            <Input placeholder="Enter category name" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={3} placeholder="Enter description (optional)" />
                        </Form.Item>
                        <Form.Item name="icon" label="Icon Class (FontAwesome)">
                            <Input placeholder="e.g., fa-solid fa-spa" />
                        </Form.Item>
                        <Form.Item name="color" label="Color">
                            <Input type="color" style={{ width: 100, height: 32, padding: 2 }} />
                        </Form.Item>
                        <Form.Item name="sortOrder" label="Sort Order">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        {editingId && (
                            <Form.Item name="isActive" label="Active" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        )}
                    </Form>
                </Modal>
            </div>
        </MainLayout>
    )
}
