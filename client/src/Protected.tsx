import { AuthenticatedTemplate } from "@azure/msal-react";
import { NavBar } from "./NavBar";
import { Sidebar } from "./Sidebar";
import { Viewer } from "./Viewer";

export default function Protected() {
    return (
        <AuthenticatedTemplate>
            <main id="app">
                <Sidebar />
                <div id="viewer">
                    <NavBar />
                    <Viewer />
                </div>
            </main>
        </AuthenticatedTemplate >
    )
};