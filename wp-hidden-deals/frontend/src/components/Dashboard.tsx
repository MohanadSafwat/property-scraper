import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Skeleton, Alert, Empty, Space, Typography } from 'antd';
import { SearchOutlined, FilterOutlined, UpOutlined, DownOutlined, LinkOutlined } from '@ant-design/icons';
import './dashboard.css';

interface Listing {
    title: string;
    price: number;
    location: string;
    link: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

interface ApiResponse {
    listings: Listing[];
    pagination: Pagination;
}

declare global {
    interface Window {
        hiddenDealsConfig: {
            apiUrl: string;
            nonce: string;
        };
    }
}

const mockListings: Listing[] = [
    {
        title: 'Luxury Downtown Apartment',
        price: 450000,
        location: 'Downtown Cairo',
        link: 'https://example.com/listing/1'
    },
    {
        title: 'Modern Villa with Garden',
        price: 750000,
        location: 'New Cairo',
        link: 'https://example.com/listing/2'
    },
    {
        title: 'Cozy Studio Near Metro',
        price: 280000,
        location: 'Heliopolis',
        link: 'https://example.com/listing/3'
    }
];

const HiddenDealsDashboard: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<keyof Listing | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('asc');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        location: ''
    });
    const [tempFilters, setTempFilters] = useState({
        minPrice: '',
        maxPrice: '',
        location: ''
    });
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const fetchListings = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.itemsPerPage.toString(),
                ...(sortField && sortDirection && { sortField, sortDirection }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(filters.location && { location: filters.location })
            });

            let response;
            try {
                response = await fetch(`${window.hiddenDealsConfig.apiUrl}?${queryParams}`, {
                    headers: {
                        'X-WP-Nonce': window.hiddenDealsConfig.nonce
                    }
                });
                if (!response.ok) throw new Error('API not available');
                const data: ApiResponse = await response.json();
                setListings(data.listings || []);
                setPagination(data.pagination || pagination);
            } catch (apiError) {
                console.warn('API not available, using mock data:', apiError);
                let filteredListings = mockListings;

                if (filters.minPrice) {
                    filteredListings = filteredListings.filter(l => l.price >= parseInt(filters.minPrice));
                }
                if (filters.maxPrice) {
                    filteredListings = filteredListings.filter(l => l.price <= parseInt(filters.maxPrice));
                }
                if (filters.location) {
                    filteredListings = filteredListings.filter(l =>
                        l.location.toLowerCase().includes(filters.location.toLowerCase())
                    );
                }

                if (sortField && sortDirection) {
                    filteredListings = [...filteredListings].sort((a, b) => {
                        const aVal = a[sortField];
                        const bVal = b[sortField];

                        if (typeof aVal === 'string') {
                            return sortDirection === 'asc'
                                ? aVal.localeCompare(bVal as string)
                                : (bVal as string).localeCompare(aVal);
                        }

                        return sortDirection === 'asc'
                            ? (aVal as number) - (bVal as number)
                            : (bVal as number) - (aVal as number);
                    });
                }

                setListings(filteredListings);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: filteredListings.length,
                    itemsPerPage: filteredListings.length
                });
            }
        } catch (error) {
            setError('Failed to fetch listings');
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [pagination.currentPage, pagination.itemsPerPage, sortField, sortDirection, filters]);

    const handleFilterChange = (field: string, value: string) => {
        setTempFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const resetFilters = () => {
        setTempFilters({ minPrice: '', maxPrice: '', location: '' });
        setFilters({ minPrice: '', maxPrice: '', location: '' });
    };

    const handleSort = (field: keyof Listing) => {
        if (!['title', 'price', 'location'].includes(field)) {
            console.warn(`Invalid sort field: ${field}`);
            return;
        }

        if (sortField === field) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortField(null);
                setSortDirection(null);
            } else {
                setSortDirection('asc');
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const columns = [
        {
            title: (
                <Space onClick={() => handleSort('title')}>
                    Property
                    {sortField === 'title' && sortDirection && (sortDirection === 'asc' ? <UpOutlined /> : <DownOutlined />)}
                </Space>
            ),
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="font-medium">{text}</span>
        },
        {
            title: (
                <Space onClick={() => handleSort('price')}>
                    Price
                    {sortField === 'price' && sortDirection && (sortDirection === 'asc' ? <UpOutlined /> : <DownOutlined />)}
                </Space>
            ),
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => <span className="text-green-600 font-semibold">{formatPrice(price)}</span>
        },
        {
            title: (
                <Space onClick={() => handleSort('location')}>
                    Location
                    {sortField === 'location' && sortDirection && (sortDirection === 'asc' ? <UpOutlined /> : <DownOutlined />)}
                </Space>
            ),
            dataIndex: 'location',
            key: 'location'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Listing) =>
                record.link && (
                    <a href={record.link} target="_blank" rel="noopener noreferrer" className="action-link">
                        <LinkOutlined /> View
                    </a>
                )
        }
    ];

    if (loading) {
        return (
            <div className="dashboard-container">
                <Skeleton active title paragraph={{ rows: 2 }} />
                <Card className="filter-card">
                    <Skeleton.Input active style={{ width: '100%', marginBottom: 16 }} />
                    <Space>
                        <Skeleton.Input active style={{ width: 200 }} />
                        <Skeleton.Input active style={{ width: 200 }} />
                        <Skeleton.Input active style={{ width: 200 }} />
                        <Skeleton.Button active />
                        <Skeleton.Button active />
                    </Space>
                </Card>
                <Card>
                    <Skeleton active paragraph={{ rows: 8 }} />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button type="primary" danger onClick={fetchListings}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Typography.Title level={2}>Hidden Deals Dashboard</Typography.Title>
            <Typography.Paragraph>Monitor and manage property listings from various sources</Typography.Paragraph>

            <Card className="filter-card" title={<Space><FilterOutlined /> Filters</Space>}>
                <Space wrap>
                    <div>
                        <Typography.Text>Min Price</Typography.Text>
                        <Input
                            placeholder="e.g., 200000"
                            value={tempFilters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            type="number"
                            style={{ width: 200, marginLeft: 8 }}
                            suffix={'£'}
                        />
                    </div>
                    <div>
                        <Typography.Text>Max Price</Typography.Text>
                        <Input
                            placeholder="e.g., 800000"
                            value={tempFilters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            type="number"
                            style={{ width: 200, marginLeft: 8 }}
                            suffix={'£'}
                        />
                    </div>
                    <div>
                        <Typography.Text>Location</Typography.Text>
                        <Input
                            placeholder="e.g., London"
                            value={tempFilters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            style={{ width: 200, marginLeft: 8 }}
                        />
                    </div>
                    <Button type="primary" onClick={applyFilters}>
                        Filter
                    </Button>
                    <Button onClick={resetFilters}>Reset Filters</Button>
                </Space>
            </Card>

            <Space wrap className="stats-container">
                <Card className="stat-card">
                    <Typography.Title level={4}>Total Listings</Typography.Title>
                    <Typography.Title level={3} style={{ color: '#1890ff' }}>
                        {pagination.totalItems}
                    </Typography.Title>
                </Card>
                <Card className="stat-card">
                    <Typography.Title level={4}>Average Price</Typography.Title>
                    <Typography.Title level={3} style={{ color: '#52c41a' }}>
                        {listings.length > 0
                            ? formatPrice(listings.reduce((sum, l) => sum + l.price, 0) / listings.length)
                            : 'N/A'}
                    </Typography.Title>
                </Card>
            </Space>

            <Table
                columns={columns}
                dataSource={listings}
                rowKey={(record) => record.link}
                pagination={{
                    current: pagination.currentPage,
                    pageSize: pagination.itemsPerPage,
                    total: pagination.totalItems,
                    pageSizeOptions: ['10', '20', '50'],
                    showSizeChanger: true,
                    onChange: (page) => setPagination(prev => ({ ...prev, currentPage: page })),
                    onShowSizeChange: (_current, size) => setPagination(prev => ({ ...prev, itemsPerPage: size, currentPage: 1 }))
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={<SearchOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                            description={
                                <Space direction="vertical">
                                    <Typography.Title level={4}>No listings found</Typography.Title>
                                    <Typography.Text>
                                        Try adjusting your filters or check back later for new deals.
                                    </Typography.Text>
                                </Space>
                            }
                        />
                    )
                }}
            />
        </div>
    );
};

export default HiddenDealsDashboard;