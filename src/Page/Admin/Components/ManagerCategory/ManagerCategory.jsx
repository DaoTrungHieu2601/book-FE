import { useEffect, useState } from 'react';
import styles from './ManagerCategory.module.scss';
import classNames from 'classnames/bind';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    requestCreateCategory,
    requestDeleteCategory,
    requestGetCategory,
    requestUpdateCategory,
} from '../../../../config/request';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const cx = classNames.bind(styles);

function ManagerCategory() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [form] = Form.useForm();

    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await requestGetCategory(); // giả sử trả về { metadata: [...] }
            setCategories(res.metadata || []);
        } catch (err) {
            const errMsg = err?.response?.data?.message || err.message || 'Lấy danh mục thất bại';
            message.error(errMsg);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa danh mục này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await requestDeleteCategory(id); // giả sử endpoint DELETE /categories/:id
                    message.success('Đã xóa danh mục thành công');
                    await fetchCategories();
                } catch (err) {
                    const errMsg = err?.response?.data?.message || err.message || 'Xóa thất bại';
                    message.error(errMsg);
                }
            },
        });
    };

    const handleSubmit = async (values) => {
        try {
            const name = values.nameCategory?.trim();
            if (!name) {
                message.error('Vui lòng nhập tên danh mục!');
                return;
            }

            if (modalMode === 'add') {
                // Gọi API tạo: body { name: '...' } để phù hợp với BE hiện tại
                await requestCreateCategory({ name });
                message.success('Đã tạo danh mục thành công');
            } else {
                // Gọi API update: PUT /categories/:id với body { name: '...' }
                const id = values.id;
                if (!id) {
                    message.error('ID danh mục không hợp lệ');
                    return;
                }
                await requestUpdateCategory(id, { name });
                message.success('Đã cập nhật danh mục thành công');
            }

            setIsModalOpen(false);
            form.resetFields();
            await fetchCategories();
        } catch (error) {
            const errMsg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra!';
            message.error(errMsg);
        }
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'nameCategory',
            key: 'nameCategory',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => text ? new Date(text).toLocaleString('vi-VN') : '-'
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => text ? new Date(text).toLocaleString('vi-VN') : '-'
        },
        {
            title: 'Quản lý',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <EditOutlined
                                className="text-[15px] !text-blue-500"
                                onClick={() => {
                                    setModalMode('edit');
                                    setIsModalOpen(true);
                                    // set giá trị rõ ràng
                                    form.setFieldsValue({
                                        nameCategory: record.nameCategory,
                                        id: record._id,
                                    });
                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sửa</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DeleteOutlined
                                className="text-[15px] !text-red-500"
                                onClick={() => handleDelete(record._id)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Xóa</p>
                        </TooltipContent>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2 className='font-semibold'>Quản lý danh mục</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setModalMode('add');
                        setIsModalOpen(true);
                        form.resetFields();
                    }}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="_id"
                bordered
                className={cx('category-table')}
                pagination={{
                    showTotal: (total, range) => `Hiện ${range[0]} trên ${total} mục`,
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    position: ['bottomRight'],
                }}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={modalMode === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="nameCategory"
                        label="Tên danh mục"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên danh mục!',
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item className={cx('form-actions')}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {modalMode === 'add' ? 'Thêm' : 'Lưu'}
                            </Button>
                            <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ManagerCategory;
