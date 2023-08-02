import { NextApiResponse } from "next";
import { withMiddlewares } from "../../middlewares";
import { NextApiRequestWithUser, authMiddleware } from "../../middlewares/auth-middleware";
import { RefreshApiResponse } from "./refresh";


function handler(  req: NextApiRequestWithUser,
  res: NextApiResponse<RefreshApiResponse>) {
    // Get the HTTP-only cookie from the request object
    const cookies = req.cookies; // The "cookies" object contains all the cookies sent with the request
    const refreshTokenFromCookie = cookies.refreshToken || ""; // 'refreshToken' is the name of the cookie
    // Do something with the "refreshTokenFromCookie" value (e.g., refresh access token)
    // ...
  
    // Send a response or data as needed
    res.status(200).json({ success: true, data:{token:refreshTokenFromCookie } });
  }

  export default withMiddlewares(authMiddleware, handler)
