import React, { useEffect, useState } from 'react'
import MainLayout from '@afx/views/base/main.layout'
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm, Tag, Select, Switch } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { ServiceGetAllService, ServiceCreateService, ServiceUpdateService, ServiceDeleteService } from '@afx/services/service.service'
import { ServiceCategoryGetActiveService } from '@afx/services/service-category.service'
import { IService } from '@afx/interfaces/service.iface'
import { IServiceCategory } from '@afx/interfaces/service-category.iface'

export default function MasterService() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<IService[]>([])
    const [categories, setCategories] = useState<IServiceCategory[]>([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [searchText, setSearchText] = useState('')
    const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined)
    const [form] = Form.useForm()

    const fetchCategories = async () => {
        try {
            const res = await ServiceCategoryGetActiveService()
            if (res.success) {
                setCategories(res.data)
            }
        } catch (err: any) {
            console.error('Failed to fetch categories:', err)
        }
    }

    const fetchData = async (page = 1, pageSize = 10, search?: string, categoryId?: number) => {
        setLoading(true)
        try {
            const params: any = { page, pageSize }
            if (search) params.search = search
            if (categoryId) params.categoryId = categoryId
            
            const res = await ServiceGetAllService(params)
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
        fetchCategories()
        fetchData()
    }, [])

    const handleTableChange = (pag: any) => {
        fetchData(pag.current, pag.pageSize, searchText, filterCategory)
    }

    const handleSearch = () => {
        fetchData(1, pagination.pageSize, searchText, filterCategory)
    }

    const handleCategoryFilter = (value: number | undefined) => {
        setFilterCategory(value)
        fetchData(1, pagination.pageSize, searchText, value)
    }

    const handleCreate = () => {
        setEditingId(null)
        form.resetFields()
        form.setFieldsValue({ duration: 60, price: 0, isActive: true })
        setIsModalOpen(true)
    }

    const handleEdit = (record: IService) => {
        setEditingId(record.id)
        form.setFieldsValue(record)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await ServiceDeleteService(id)
            if (res.success) {
                message.success('Service deleted successfully')
                fetchData(pagination.current, pagination.pageSize, searchText, filterCategory)
            }
        } catch (err: any) {
            message.error(err.message || 'Failed to delete')
        }
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (editingId) {
                const res = await ServiceUpdateService(editingId, values)
                if (res.success) {
                    message.success('Service updated successfully')
                }
            } else {
                const res = await ServiceCreateService(values)
                if (res.success) {
                    message.success('Service created successfully')
                }
            }
            setIsModalOpen(false)
            fetchData(pagination.current, pagination.pageSize, searchText, filterCategory)
        } catch (err: any) {
            if (err.errorFields) return
            message.error(err.message || 'Operation failed')
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price)
    }

    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id',
            width: 70
        },
        { 
            title: 'Name', 
            dataIndex: 'name', 
            key: 'name',
            width: 200
        },
        { 
            title: 'Category', 
            dataIndex: 'categoryName', 
            key: 'categoryName',
            width: 150
        },
        { 
            title: 'Duration', 
            dataIndex: 'duration', 
            key: 'duration',
            width: 100,
            render: (duration: number) => `${duration} min`
        },
        { 
            title: 'Price', 
            dataIndex: 'price', 
            key: 'price',
            width: 130,
            render: (price: number) => formatPrice(price)
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
            width: 70,
            render: (text: string) => text ? <i className={text}></i> : '-' 
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
            width: 100,
            render: (_: any, record: IService) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm 
                        title="Delete this service?" 
                        description="This will soft-delete the service."
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
                    <h2 style={{ margin: 0 }}>Services Management</h2>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Service
                    </Button>
                </div>

                {/* Filters */}
                <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                    <Input
                        placeholder="Search by name..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Select
                        placeholder="Filter by category"
                        value={filterCategory}
                        onChange={handleCategoryFilter}
                        style={{ width: 200 }}
                        allowClear
                    >
                        {categories.map((cat) => (
                            <Select.Option key={cat.id} value={cat.id}>
                                {cat.name}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button onClick={handleSearch}>Search</Button>
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
                    scroll={{ x: 1100 }}
                />

                <Modal
                    title={editingId ? "Edit Service" : "Add Service"}
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={() => setIsModalOpen(false)}
                    width={600}
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item 
                            name="categoryId" 
                            label="Category" 
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select placeholder="Select category">
                                {categories.map((cat) => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item 
                            name="name" 
                            label="Name" 
                            rules={[
                                { required: true, message: 'Please enter service name' },
                                { max: 100, message: 'Name cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter service name" />
                        </Form.Item>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <Form.Item 
                                name="duration" 
                                label="Duration (minutes)" 
                                rules={[
                                    { required: true, message: 'Please enter duration' },
                                ]}
                                style={{ flex: 1 }}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    min={1} 
                                    max={480}
                                    placeholder="60"
                                />
                            </Form.Item>
                            <Form.Item 
                                name="price" 
                                label="Price (IDR)" 
                                rules={[
                                    { required: true, message: 'Please enter price' },
                                ]}
                                style={{ flex: 1 }}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/,/g, '') as unknown as number}
                                    placeholder="150000"
                                />
                            </Form.Item>
                        </div>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={3} placeholder="Enter description (optional)" />
                        </Form.Item>
                        <Form.Item name="icon" label="Icon Class (FontAwesome)">
                            <Input placeholder="e.g., fa-solid fa-spa" />
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
