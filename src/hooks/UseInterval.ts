import { useEffect } from "react"

export function useInterval(intervalFunc: () => void): void {
    useEffect(() => {
        const intervalId = window.setInterval(intervalFunc, 1000)
        return () => {
            window.clearInterval(intervalId)
        }
    }, [intervalFunc])
}