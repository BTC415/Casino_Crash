import { AnimatedSprite, Container, Graphics, Sprite, Text, useTick } from "@pixi/react";
import { TextStyle, Texture, Graphics as GraphicsRaw, ColorMatrixFilter } from "pixi.js";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { renderCurve as _renderCurve, createGradTexture, curveFunction, maskDraw as _drawMask, smoothen, _drawOuterBoundery, _drawInnerBoundery, interpolate, webpORpng } from "../../utils";
import { dimensionType, gameAnimStatusType } from "../../@types";

const AppStage = ({ payout, game_anim_status, dimension, pixiDimension, trigParachute }: { payout: number, game_anim_status: gameAnimStatusType, dimension: dimensionType, pixiDimension: dimensionType, trigParachute: { uniqId: number, isMe: boolean } }) => {

    const tickRef = useRef(0)
    const [hueRotate, setHueRotate] = useState(0)
    const [planeScale, setPlaneScale] = useState(0.2)
    const [pulseBase, setPulseBase] = useState(0.8)
    const [planeFrames, setPlaneFrames] = useState<Texture[] | undefined>()
    const [parachuteMeFrames, setParachuteMeFrames] = useState<Texture[] | undefined>()
    const [parachuteElseFrames, setParachuteElseFrames] = useState<Texture[] | undefined>()
    const [parachutesMe, setParachutesMe] = useState<{ x: number, y: number }[]>([])
    const [parachutesElse, setParachutesElse] = useState<{ x: number, y: number }[]>([])
    const [planeX, setPlaneX] = useState(0)
    const [ontoCorner, setOntoCorner] = useState(0)

    const renderCurve = useCallback((g: GraphicsRaw) => _renderCurve(g, dimension), [dimension])
    const drawOuterBoundery = useCallback((g: GraphicsRaw) => _drawOuterBoundery(g, dimension), [dimension])
    const drawInnerBoundery = useCallback((g: GraphicsRaw) => _drawInnerBoundery(g, dimension), [dimension])

    const addParachute = (isMe: boolean) => {
        const pos = {
            x: (pulseBase + pulseGraph) * planeX,
            y: dimension.height - 40 - (1 - pulseGraph) * curveFunction(planeX, { width: dimension.width - 40, height: dimension.height - 40 })
        }
        if (isMe) {
            setParachutesMe(v => ([...v, pos]))
        } else {
            setParachutesElse(v => ([...v, pos]))
        }
    }
    useEffect(() => {
        if (trigParachute.uniqId > 0) {
            addParachute(trigParachute.isMe)
        }
    }, [trigParachute.uniqId])

    const gradTexture = useMemo(() => createGradTexture(dimension), [dimension])

    const handleResize = () => {
        setPlaneScale(interpolate(window.innerWidth, 400, 1920, 0.5, 0.2))
        setPulseBase(interpolate(window.innerWidth, 400, 1920, 0.6, 0.8))
    }
    useEffect(() => {
        const _plane = []
        for (let i = 1; i <= 15; i++) {
            _plane.push(Texture.from(`plane-anim-${i}.${webpORpng}`));
        }
        setPlaneFrames(_plane)
        const _parachuteMe = []
        for (let i = 1; i <= 61; i++) {
            _parachuteMe.push(Texture.from(`parachute-red-anim-${i}.${webpORpng}`));
        }
        setParachuteMeFrames(_parachuteMe)
        const _parachuteElse = []
        for (let i = 1; i <= 61; i++) {
            _parachuteElse.push(Texture.from(`parachute-gray-anim-${i}.${webpORpng}`));
        }
        setParachuteMeFrames(_parachuteMe)
        setParachuteElseFrames(_parachuteElse)
        const t_out = setInterval(() => setOntoCorner(prev => (prev + 1)), 100)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            clearInterval(t_out)
        }
    }, [])

    useTick((delta) => {
        setHueRotate(prev => (prev + delta / 500))
    });

    const maskRef = useRef<GraphicsRaw>(null);
    const dotRef = useRef<GraphicsRaw>(null);
    const gameBoardMask = useRef<GraphicsRaw>(null);



    const curveMask = useCallback((g: GraphicsRaw) => _drawMask(g, { width: dimension.width - 40, height: dimension.height - 40 }), [dimension])
    const dotLeftBottom = useCallback((g: GraphicsRaw) => _drawMask(g, { width: 1, height: 1 }), [])



    const [pulseGraph, setPulseGraph] = useState(1);
    useTick((delta) => {
        if (game_anim_status !== "ANIM_STARTED") return
        const amp = 0.06
        let pulse = amp;
        tickRef.current += delta * 0.01
        pulse = Math.sin(tickRef.current) * amp
        setPulseGraph(pulse)
    })
    useEffect(() => { setPlaneX(smoothen(Math.min(tickRef.current * 300, dimension.width - 40), { width: dimension.width - 40, height: dimension.height - 40 })) }, [tickRef.current])
    useEffect(() => {
        if (game_anim_status === "WAITING") tickRef.current = 0
        if (game_anim_status === "ANIM_CRASHED") setOntoCorner(0)
    }, [game_anim_status])

    const posPlane = useMemo(() => {
        const _ontoCorner = game_anim_status === "ANIM_CRASHED" ? ontoCorner : 0
        return {
            x: (pulseBase + pulseGraph) * planeX + _ontoCorner * 150 + 40,
            y: dimension.height - 40 - (1 - pulseGraph) * curveFunction(planeX, { width: dimension.width - 40, height: dimension.height - 40 }) - _ontoCorner * 50
        }
    }, [pulseGraph, planeX, dimension, game_anim_status, ontoCorner])
    const colorMatrix = useMemo(() => {
        const c = new ColorMatrixFilter();
        c.hue(hueRotate * 100, true);
        return c
    }, [hueRotate])

    return (
        <Container>
            <Sprite filters={[colorMatrix]} texture={gradTexture} width={dimension.width - 40} height={dimension.height - 40} position={{ x: 40, y: 0 }} />
            <Sprite
                image={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/sun-like-bg.${webpORpng}`}
                anchor={0.5}
                x={-100} y={dimension.height + 100}
                rotation={hueRotate}
                scale={2}
            />
            <Graphics ref={gameBoardMask} draw={dotLeftBottom} x={40} scale={{ x: dimension.width - 40, y: dimension.height - 40 }} />
            <Container mask={gameBoardMask.current} visible={game_anim_status === "ANIM_STARTED"} position={{ x: 40, y: 0 }} scale={{ x: 1, y: 1 }}>
                <Graphics
                    mask={maskRef.current}
                    draw={renderCurve}
                    position={{ x: 0, y: dimension.height - 40 }}
                    scale={{ x: pulseBase + pulseGraph, y: 1 - pulseGraph }}
                    pivot={{ x: 0, y: dimension.height - 40 }} />
                <Graphics
                    scale={{ x: (pulseBase + pulseGraph) * planeX / (dimension.width - 40), y: 1 }}
                    name="mask"
                    draw={curveMask}
                    ref={maskRef}
                />
            </Container>
            <Container visible={game_anim_status !== "WAITING"}>
                {planeFrames !== undefined &&
                    <Container>
                        <AnimatedSprite
                            mask={gameBoardMask.current}
                            rotation={-Math.PI / 10}
                            pivot={{ x: 0.08, y: 0.54 }}
                            textures={planeFrames}
                            anchor={{ x: 0.07, y: 0.55 }}
                            scale={planeScale}
                            animationSpeed={0.5}
                            isPlaying={true}
                            initialFrame={0}
                            position={posPlane}
                        />
                        {parachutesMe.map((item, i) =>
                            <AnimatedSprite
                                key={i}
                                mask={gameBoardMask.current}
                                pivot={{ x: 0.08, y: 0.54 }}
                                textures={parachuteMeFrames}
                                anchor={{ x: 0.4, y: 0.45 }}
                                scale={2}
                                animationSpeed={0.3}
                                isPlaying={true}
                                initialFrame={0}
                                position={item}
                                loop={false}
                                onComplete={() => parachutesMe.slice(1)}
                            />
                        )}
                        {parachutesElse.map((item, i) =>
                            <AnimatedSprite
                                key={i}
                                mask={gameBoardMask.current}
                                pivot={{ x: 0.08, y: 0.54 }}
                                textures={parachuteElseFrames}
                                anchor={{ x: 0.4, y: 0.45 }}
                                scale={2}
                                animationSpeed={0.3}
                                isPlaying={true}
                                initialFrame={0}
                                position={item}
                                loop={false}
                                onComplete={() => parachutesElse.slice(1)}
                            />
                        )}
                    </Container>
                }
                <Text visible={game_anim_status === "ANIM_STARTED"} text={payout.toFixed(2) + "x"}
                    anchor={0.5}
                    x={dimension.width / 2}
                    y={dimension.height / 2}
                    style={
                        new TextStyle({
                            align: 'center',
                            fontFamily: 'Roboto',
                            fontSize: 100,
                            fontWeight: '700',
                            fill: ['#ffffff', '#ffffff'], // gradient
                            stroke: '#111111',
                            strokeThickness: 2,
                            letterSpacing: 0,
                            dropShadow: false,
                            dropShadowColor: '#ccced2',
                            dropShadowBlur: 4,
                            dropShadowAngle: Math.PI / 6,
                            dropShadowDistance: 6,
                        })
                    } />

            </Container>
            <Graphics draw={drawInnerBoundery} />
            <Container ref={dotRef}>
                <Graphics draw={dotLeftBottom} scale={{ x: 40, y: dimension.height - 40 }} />
                <Graphics position={{ x: 40, y: dimension.height - 40 }} scale={{ x: dimension.width - 40, y: 40 }} draw={dotLeftBottom} />
            </Container>
            <Container mask={dotRef.current}>
                {Array.from({ length: 30 }, (_, i) => (i * 140000 / pixiDimension.width + 10)).map((coor, i) =>
                    <Container key={i}>
                        <Sprite
                            scale={0.4}
                            image={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/dot.${webpORpng}`}
                            anchor={0.5}
                            // x={20} y={coor + (Math.max(0, tickRef.current - 5) * 100 % (140000 / pixiDimension.width)) - 100}
                            x={20} y={coor + (hueRotate * 400 % (140000 / pixiDimension.width)) - 100}
                        />
                        <Sprite
                            scale={0.4}
                            image={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/dot.${webpORpng}`}
                            anchor={0.5}
                            // x={coor - (Math.max(0, tickRef.current - 5) * 100 % (140000 / pixiDimension.width)) - 100}
                            // y={dimension.height - 20}
                            x={coor - (hueRotate * 400 % (140000 / pixiDimension.width)) - 100}
                            y={dimension.height - 20}
                        />
                    </Container>
                )}
            </Container>
            <Graphics draw={drawOuterBoundery} />

            {/* <WaitingSprite visible={game_anim_status === "WAITING"} dimension={dimension} /> */}

        </Container>

        // <Text text="Loading..." anchor={0.5}
        //     x={700}
        //     y={315}
        //     style={
        //         new TextStyle({
        //             align: 'center',
        //             fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
        //             fontSize: 50,
        //             fontWeight: '400',
        //             fill: ['#ffffff', '#00ff99'], // gradient
        //             stroke: '#01d27e',
        //             strokeThickness: 5,
        //             letterSpacing: 20,
        //             dropShadow: true,
        //             dropShadowColor: '#ccced2',
        //             dropShadowBlur: 4,
        //             dropShadowAngle: Math.PI / 6,
        //             dropShadowDistance: 6,
        //             wordWrap: true,
        //             wordWrapWidth: 440,
        //         })
        //     } />
    );
};
export default AppStage