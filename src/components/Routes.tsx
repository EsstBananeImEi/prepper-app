import React, { ReactElement } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import Home from './home-component/Home'
import MyErrorMessage from './my-error-component/MyErrorMessage'
import Shopping from './storage-components/shopping-card/Shopping'
import StorageList from './storage-components/storage-list/StorageList'
import StorageForm from './storage-components/storage-form/StorageForm'
import StorageDetail from './storage-components/storage-detail/StorageDetail'

export default function Routes(): ReactElement {
    return (
        <Switch>
            <Route
                exact
                path='/items/error/:message'
                render={() => <MyErrorMessage />}
            />
            <Route
                exact
                path='/items/:id/edit'
                render={() => <StorageForm key="edit" />}
            />
            <Route
                exact
                path='/items/new'
                render={() => <StorageForm key="new" />}
            />
            <Route
                exact
                path='/items/:id'
                render={() => <StorageDetail />}
            />
            <Route
                exact
                path='/items'
                render={() => <StorageList />}
            />

            <Route
                path='/basket'
                render={() => <Shopping />}
            />

            <Route
                exact
                path='/home'
                render={() => <Home />}
            />
            <Route
                path='/'
                render={() => <Redirect to="/home" />}
            />
        </Switch>
    )
}
