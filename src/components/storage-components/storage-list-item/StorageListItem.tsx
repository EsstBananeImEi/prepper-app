import { EditOutlined, ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Card, Image } from 'antd';
import React, { ReactElement } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { StorageModel } from '../StorageModel';

interface Props {
    storageItem: StorageModel
}

export default function StorageListItem(props: Props): ReactElement {
    const storageItem = props.storageItem
    const { Meta } = Card;
    const history = useHistory()

    const getAvailable = () => {
        const amount = storageItem.amount
        const lowestAmount = storageItem.lowestAmount
        const midAmount = storageItem.midAmount
        const unit = amount > 1 ? storageItem.unit + 'en' : storageItem.unit
        const color = { color: 'green' }
        const message = 'Lagerbestand:'

        if (amount < midAmount && amount >= lowestAmount) {
            color['color'] = 'orange'
        }
        else {
            color['color'] = 'red'
        }
        return <span style={color}>{message} {amount} {unit}</span>

    }

    const onGoToDetail = () => history.push(`/storeditems/${storageItem.id}`)
    const onGoToEdit = () => history.push(`/storeditems/${storageItem.id}/edit`)

    return (

        <Card
            style={{ width: 300 }}
            actions={
                [
                    <InfoCircleOutlined onClick={onGoToDetail} key="info" />,
                    <EditOutlined onClick={onGoToEdit} key="edit" />,
                    // <ShoppingCartOutlined disabled key="shopping" />,
                ]}
        >
            <Link to={`/storeditems/${storageItem.id}`}>
                <Meta
                    avatar={<Avatar src={storageItem.icon} />}
                    title={storageItem.name}
                    description={getAvailable()}
                />
            </Link>
        </Card>
    )
}
