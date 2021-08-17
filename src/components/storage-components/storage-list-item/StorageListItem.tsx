import { EditOutlined, ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Card, Image } from 'antd';
import React, { ReactElement } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { pluralFormFactory } from '../../../shared/Factories';
import { StorageModel } from '../StorageModel';

interface Props {
    storageItem: StorageModel
}

export default function StorageListItem(props: Props): ReactElement {
    const storageItem = props.storageItem
    const { Meta } = Card;
    const history = useHistory()

    const getAvailable = () => {
        const color = { color: 'red' };

        if (storageItem.amount >= storageItem.midAmount) {
            color['color'] = 'green'
        }
        else if (storageItem.amount < storageItem.midAmount && storageItem.amount >= storageItem.lowestAmount) {
            color['color'] = 'orange'
        }

        return <span style={color}>Inventory: {storageItem.amount} {pluralFormFactory(storageItem.unit, storageItem.amount)}</span>

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
