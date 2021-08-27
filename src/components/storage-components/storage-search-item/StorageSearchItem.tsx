import React, { ReactElement, useCallback } from 'react'
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { storageApi } from '../../../hooks/StorageApi';
import { Setter } from '../../../types/Types';
import { StorageModel } from '../StorageModel';
import { debounce } from 'lodash';
import { storedItemsSearchApi } from '../../../shared/Constants';

interface Props {
    callback: Setter<StorageModel[]>

}

export default function StorageSearchItem(props: Props): ReactElement {

    const debounceHandler = useCallback(
        debounce((searchString: string) => {
            storageApi('get', storedItemsSearchApi(searchString), props.callback)
        }, 800),
        []
    );

    const onSearch = (searchString: string) => {
        debounceHandler(searchString)
    }

    return (
        <Input onChange={(e) => onSearch(e.target.value)} placeholder="input search" addonAfter={<SearchOutlined />} />
    )
}
