import React, { ReactElement } from 'react';
import StorageFormComponent from '../storage-form/StorageForm';

export default function StorageCreateItem(): ReactElement {

    return (
        <StorageFormComponent
            name=''
            amount=''
            lowestAmount=''
            midAmount=''
            unit=''
            isEdit={false}
        />

    )


}
