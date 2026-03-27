import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js";

const addProduct = async (req, res) => {
    try {

        const { name, description, price, sale, salePrice, saleModify, category, subCategory, sizes, number, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        const image5 = req.files.image5 && req.files.image5[0]

        const images = [image1, image2, image3, image4, image5].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            price: Number(price),
            sale: sale === "true" ? true : false,
            salePrice: Number(salePrice),
            saleModify: saleModify,
            image: imagesUrl,
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            number: JSON.parse(number),
            bestseller: bestseller === "true" ? true : false,
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProduct = async (req, res) => {
    try {

        const {id, name, description, price, sale, salePrice, saleModify, category, subCategory, sizes, number, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        const image5 = req.files.image5 && req.files.image5[0]

        const images = [image1, image2, image3, image4, image5].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            price: Number(price),
            sale: sale === "true" ? true : false,
            salePrice: Number(salePrice),
            saleModify: saleModify,
            image: imagesUrl,
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            number: JSON.parse(number),
            bestseller: bestseller === "true" ? true : false,
            date: Date.now()
        }

        const updatedProduct  = await productModel.findByIdAndUpdate(id, productData );
        if (!updatedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product Updated"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listProducts = async (req, res) => {
    try {

        const products = await productModel.find({});
        res.json({ success: true, products })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const removeProduct = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const singleProduct = async (req, res) => {
    try {

        const { productID } = req.body
        const product = await productModel.findById(productID)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addProduct, updateProduct, listProducts, removeProduct, singleProduct }