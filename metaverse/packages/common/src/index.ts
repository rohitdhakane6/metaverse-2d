import * as z from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.enum(["user", "admin"]),
})

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const UpdateMetadataSchema = z.object({
    avatarId: z.string()
})

export const CreateSpaceSchema = z.object({
    name: z.string().min(3, "Name should be at least 3 characters"),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    thumbnail: z.string().url().default("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800"),
    mapId: z.string().optional(),
})

export const DeleteElementSchema = z.object({
    id: z.string(),
})

export const AddElementSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
})

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string(),
})

export const CreateAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
})

export const CreateMapSchema = z.object({
    thumbnail: z.string().url(), // Ensure it's a valid URL
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/, "Invalid dimensions format (should be WxH, e.g., 500x500)"),
    name: z.string().min(3, "Name should be at least 3 characters"), // You can also set minimum length for the name
    defaultElements: z.array(
        z.object({
            elementId: z.string().min(1, "Element ID is required"),
            x: z.number().min(0, "X coordinate cannot be negative").max(10000, "X coordinate is too large"), // Example bounds for X
            y: z.number().min(0, "Y coordinate cannot be negative").max(10000, "Y coordinate is too large"), // Example bounds for Y
        })
    ),
});


