import { Container, Sprite } from "@pixi/react"
import { dimensionType } from "../../@types"
import React, { useEffect, useState } from 'react'
import { interpolate, webpORpng } from "../../utils"
const WaitingSprite = ({ visible, dimension }: { visible: boolean, dimension: dimensionType }) => {
    const [rotate, setRotate] = useState(0)
    const [scale, setScale] = useState(0.5)
    const handleResize = () => {
        setScale(interpolate(window.innerWidth, 400, 1920, 1, 0.3))
    }
    useEffect(() => {
        setInterval(() => setRotate(prev => (prev + 1)), 100)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])
    return (
        <Container visible={visible} >
            <Sprite
                image={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/propeller.${webpORpng}`}
                anchor={0.5} scale={scale}
                x={dimension.width / 2} y={dimension.height / 2}
                rotation={rotate * 0.3}
            />
        </Container>
    )
}
export default WaitingSprite