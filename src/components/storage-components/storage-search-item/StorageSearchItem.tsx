import React, { ReactElement, useCallback, useState } from 'react'
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { storageApi } from '../../../hooks/StorageApi';
import { Setter } from '../../../types/Types';
import { StorageModel } from '../StorageModel';
import { debounce } from 'lodash';
import { itemSearchApi } from '../../../shared/Constants';
import style from './StorageSearchItem.module.css'

interface Props {
    callback: Setter<StorageModel[]>

}

export default function StorageSearchItem(props: Props): ReactElement {
    // const [searchString, setSearchString] = useState('')

    const debounceHandler = useCallback(
        debounce((searchString: string) => {
            storageApi('get', itemSearchApi(searchString), props.callback)
        }, 800)
        , [props.callback])


    const onSearch = (searchString: string) => {
        debounceHandler(searchString)
    }

    return (
        <Input className={style.customInputField} onChange={(e) => onSearch(e.target.value)} placeholder="Lebensmittel / Gegenstand Suchen" addonAfter={<SearchOutlined />} />
    )
}
