import React, { ReactElement } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import Home from './home-component/Home'
import MyErrorMessage from './my-error-component/MyErrorMessage'
import Shopping from './storage-components/shopping-card/Shopping'
import StorageList from './storage-components/storage-list/StorageList'
import StorageDetailForm from './storage-components/storage-form/StorageForm'
import StorageForm from './storage-components/storage-form/StorageForm'
import StorageDetail from './storage-components/storage-detail/StorageDetail'

export default function Routes(): ReactElement {
    return (
        <Switch>
            <Route path='/items/error/:message'>
                <MyErrorMessage />
            </Route>
            <Route path='/items/:id/edit'>
                <StorageForm />
            </Route>
            <Route path='/items/new'>
                <StorageForm />
            </Route>
            <Route path='/items/:id'>
                <StorageDetail />
            </Route>
            <Route path='/items'>
                <StorageList />
            </Route>
            {/* <Route path='/basket'>
                <Shopping />
            </Route> */}
            <Route path='/home'>
                <Home />
            </Route>
            <Route path='/'>
                <Redirect to="/home" />
            </Route>
        </Switch>
    )
}
