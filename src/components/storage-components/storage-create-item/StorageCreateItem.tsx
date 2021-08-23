import React, { ReactElement } from 'react';
import StorageForm from '../storage-form/StorageForm';
import StorageFormV2 from '../storage-form/StorageFormV2';

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
