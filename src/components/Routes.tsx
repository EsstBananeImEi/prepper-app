import React, { ReactElement } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import Home from './home-component/Home'
import MyErrorMessage from './my-error-component/MyErrorMessage'
import Shopping from './storage-components/shopping-card/Shopping'
import StorageCreateItem from './storage-components/storage-create-item/StorageCreateItem'
import StorageDetail from './storage-components/storage-detail/StorageDetail'
import StorageEditItem from './storage-components/storage-edit-item/StorageEditItem'
import StorageList from './storage-components/storage-list/StorageList'

export default function Routes(): ReactElement {
    return (
        <Switch>
            <Route path='/storedItems/error/:message'>
                <MyErrorMessage />
            </Route>
            <Route path='/storedItems/:id/edit'>
                <StorageEditItem />
            </Route>
            <Route path='/storedItems/new'>
                <StorageCreateItem />
            </Route>
            <Route path='/storedItems/:id'>
                <StorageDetail />
            </Route>
            <Route path='/storedItems'>
                <StorageList />
            </Route>
            <Route path='/basket'>
                <Shopping />
            </Route>
            <Route path='/home'>
                <Home />
            </Route>
            <Route path='/'>
                <Redirect to="/home" />
            </Route>
        </Switch>
    )
}
