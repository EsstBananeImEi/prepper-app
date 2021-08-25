import React, { ReactElement } from 'react'
import { Input } from 'antd';


export default function StorageSearchItem(): ReactElement {
    const { Search } = Input;
    return (
        <Search placeholder="input search loading default" />
    )
}
