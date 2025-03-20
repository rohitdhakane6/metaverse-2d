import { Router } from "express";
import db from "@repo/db"
import { AddElementSchema, CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "@repo/common";
import { adminMiddleware } from "../../middlewares/admin";

export const adminRouter:Router = Router();
adminRouter.use(adminMiddleware)

adminRouter.post("/element", async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }

    const element = await db.element.create({
        data: {
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
            imageUrl: parsedData.data.imageUrl,
        }
    })

    res.json({
        id: element.id
    })
})

adminRouter.put("/element/:elementId", (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }
    db.element.update({
        where: {
            id: req.params.elementId
        },
        data: {
            imageUrl: parsedData.data.imageUrl
        }
    })
    res.json({message: "Element updated"})
})

adminRouter.post("/avatar", async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }
    const avatar = await db.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl
        }
    })
    res.json({avatarId: avatar.id})
})

adminRouter.post("/map", async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Validation failed", errors: parsedData.error.errors });
        return;
    }

    // Validate dimensions format (e.g., "widthxheight")
    const dimensions = parsedData.data.dimensions.split("x");
    if (dimensions.length !== 2 || Number.isNaN(Number(dimensions[0])) || Number.isNaN(Number(dimensions[1]))) {
        res.status(400).json({ message: "Invalid dimensions format" });
        return;
    }

    const width = Number(dimensions[0]);
    const height = Number(dimensions[1]);

    try {
        const map = await db.map.create({
            data: {
                name: parsedData.data.name,
                width: width,
                height: height,
                thumbnail: parsedData.data.thumbnail,
                mapElements: {
                    create: parsedData.data.defaultElements.map(e => ({
                        elementId: e.elementId,
                        x: e.x,
                        y: e.y
                    }))
                }
            }
        });

        res.json({
            id: map.id
        });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e });
    }
});
