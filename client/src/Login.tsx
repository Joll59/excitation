import React from 'react';
import BootStrapNavBar from 'react-bootstrap/Navbar';
import Button from "react-bootstrap/Button";
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

// import { loginRequest } from './auth/authConfig';
const loginRequest = {
    scopes: ["User.Read"]
};
/**
 * Renders a logging in with a popup window
 */
const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch(e => {
            console.log(e);
        });
    }
    return (
        <div>
            <Button variant="outline-secondary" size="sm" className="ml-auto" title="Sign Out" onClick={() => handleLogin()}>Sign In</Button>
            <p>Sign in to see protected content</p>
        </div>
    )
}

/**
 * Renders a sign-out button with a popup window
 */
const SignOutButton = () => {
    const { instance } = useMsal();

    const handleLogout = () => {
        instance.logoutPopup({
            postLogoutRedirectUri: "/",
            mainWindowRedirectUri: "/0" // we need to redirect to the start page, somehow? Router?
        });
    }


    return (
        <Button variant="outline-secondary" size="sm" className="ml-auto" title="Sign Out" onClick={() => handleLogout()}>Sign out</Button>
    )
};

/**
 * Renders a navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated, wraps the main content of the page
 * @param props
 */
export const Login = (props) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <BootStrapNavBar bg="secondary" variant="dark" id="navbar">
                <div className="justify-content-end text-right" >
                    {isAuthenticated ? <SignOutButton /> : <SignInButton />}
                </div>
            </BootStrapNavBar>
            <div className="pageContent">
                {props.children}
            </div>
        </>
    );
};