import React, { ReactElement } from 'react';
import StorageForm from '../storage-form/StorageForm';

export default function StorageCreateItem(): ReactElement {

    return (
        <StorageForm
            name=''
            amount=''
            lowestAmount=''
            midAmount=''
            unit=''
            storageLocation=''
            isEdit={false}
        />

    )


}
