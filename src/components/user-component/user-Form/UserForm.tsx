// User.tsx
import React, { useState, useEffect } from "react";
import { useStore } from "../../../store/Store";
import { UserModel } from "~/shared/Models";

export default function User() {
    const [user, setUser] = useState<UserModel | null>(null);
    const [error, setError] = useState("");
    const { store, dispatch } = useStore();

    console.log("User triggered:", store.user);
    useEffect(() => {
        fetch("http://localhost:5000/user", {
            headers: {
                "Authorization": `Bearer ${store.user?.access_token}`,
                "Content-Type": "application/json"
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error("Benutzerdaten konnten nicht geladen werden");
                return res.json();
            })
            .then((data) => setUser(data))
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return <p>Lade Benutzerdaten...</p>;

    return (
        <div>
            <h2>Benutzerprofil</h2>
            <p>ID: {user.id}</p>
            <p>Benutzername: {user.username}</p>
            <p>E-Mail: {user.email}</p>
            {user.image && <img src={user.image} alt="User" width="100" />}
        </div>
    );
}
