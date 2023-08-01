import { withMiddlewares } from "../../middlewares";
import { authMiddleware } from "../../middlewares/auth-middleware";


function handler(req: { cookies: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { refreshToken: any; }): void; new(): any; }; }; }) {
    // Get the HTTP-only cookie from the request object
    const cookies = req.cookies; // The "cookies" object contains all the cookies sent with the request
    const refreshTokenFromCookie = cookies.refreshToken; // 'refreshToken' is the name of the cookie
  console.log("tttt",refreshTokenFromCookie)
    // Do something with the "refreshTokenFromCookie" value (e.g., refresh access token)
    // ...
  
    // Send a response or data as needed
    res.status(200).json({ refreshToken: refreshTokenFromCookie });
  }

  export default withMiddlewares(authMiddleware, handler)
