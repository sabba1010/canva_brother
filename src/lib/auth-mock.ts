import { createMiddleware } from "hono/factory";

export const verifyAuth = () => {
    return createMiddleware(async (c, next) => {
        const authUser = {
            session: {
                user: {
                    id: "guest-user-123",
                    name: "Guest User",
                    email: "guest@example.com",
                    image: "",
                },
            },
            token: {
                id: "guest-user-123",
                name: "Guest User",
                email: "guest@example.com",
                picture: "",
                sub: "guest-user-123",
            },
        };

        c.set("authUser", authUser);
        await next();
    });
};
