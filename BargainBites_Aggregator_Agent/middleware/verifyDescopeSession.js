import DescopeClient from '@descope/node-sdk';
const descopeClient = DescopeClient({ projectId: 'P32Knh2gZbdKFVXDxPEtzj8K1smi' });

export const verifyDescopeSession = async (req, res, next) => {
    try {
        // console.log(" verifyDescopeSession middleware triggered");
        console.log("Headers received:", req.headers);
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Missing token" });
        }
        const session = await descopeClient.validateSession(token);
        req.user = session.user;
        next();
    } catch (err) {
        console.error("Descope session validation failed:", err.message);
        return res.status(401).json({ error: "Invalid or expired session" });
    }
};
