import React, { ReactElement } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import StorageList from './storage-components/storage-list/StorageList'

export default function Routes(): ReactElement {
    return (
        <Switch>
            <Route path='/storedItems/:id/edit'>
                <p >edit</p>
            </Route>
            <Route path='/storedItems/:id'>
                <p >detail</p>
            </Route>
            <Route path='/storedItems'>
                <StorageList />
            </Route>
            <Route path='/home'>
                <p>Home</p>
            </Route>
            <Route path='/'>
                <Redirect to="/home" />
            </Route>
        </Switch>
    )
}
