import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import { exec } from "child_process";

function App(): ReactElement {

    const send = () => {
        axios({ method: "DELETE", url: 'http://localhost:3004/storedItems/1/' })
            .then((response: AxiosResponse) => {
                console.log("finished")
            })
    }

    return <>
        <button className='ui button red' onClick={send}>delete</button>
        <button className='ui button green'>reset</button>
    </>
}

export default App;
