import React from 'react'
import { ReactElement } from 'react'
import { useState } from 'react';
import { Form, Input, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { StorageModel } from '../StorageModel';
import { useStorageApi } from '../../../hooks/StorageApi';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';


export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>()
    const history = useHistory()
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', `/storeditems/${id}`)
    const [form] = Form.useForm();
    const [autoCompleteResult, setAutoCompleteResult] = useState<string[]>([]);


    axiosResponse && axiosResponse.catch((e) => {
        history.push(`/storeditems/error/${e.message}`)
    })

    if (!storageItem) { return <LoadingSpinner message="load storage items ..." /> }


    return (
        // Hier gehts weiter
        <div>{storageItem.name}</div>
    );
}

