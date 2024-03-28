import { Stage, Container } from '@pixi/react';
import { useState, useEffect } from 'react';
import { dimensionType } from '../../@types';
import AppStage from './AppStage';
import { useAviator } from '../../store/aviator';

const PIXIComponent = ({ pixiDimension, curPayout, trigParachute }: {
    pixiDimension: dimensionType, curPayout: number, trigParachute: { uniqId: number, isMe: boolean }
}) => {
    const { aviatorState } = useAviator()
    const [scale, setScale] = useState(0)
    useEffect(() => {
        setScale(Math.min(pixiDimension.width / aviatorState.dimension.width, pixiDimension.height / aviatorState.dimension.height))
    }, [pixiDimension, aviatorState.dimension])
    return (
        <Stage width={pixiDimension.width} height={pixiDimension.height} options={{ antialias: true }}>
            <Container scale={scale}>
                <AppStage payout={curPayout} game_anim_status={aviatorState.game_anim_status} dimension={aviatorState.dimension} pixiDimension={pixiDimension} trigParachute={trigParachute} />
            </Container>
        </Stage>
    );
};
export default PIXIComponent