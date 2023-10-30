import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
    publicRoutes: ["/", "/welcome"],
     afterAuth(auth, req, evt){
        // if not authenticated always bring user to welcome page
        if(!auth.userId && !auth.isPublicRoute){
            console.log("No user id");
            const welcomeUrl = new URL("/welcome", req.url);
            return NextResponse.redirect(welcomeUrl.href);
        }

        if(auth.userId){
            const url = req.nextUrl.clone();
            if(url.pathname === "/"){
                url.pathname = "/home";
                return NextResponse.redirect(url.href);
            }
        }
    }
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 