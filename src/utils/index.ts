import { ColorSource, Graphics, Texture, utils } from "pixi.js";
import { dimensionType, game_global_vars_type } from "../@types";
import { sound } from '@pixi/sound';
import { Theme, ToastPosition, toast } from "react-toastify";
export const Game_Global_Vars: game_global_vars_type = {
    curPayout: 0,
    allowedBet: false,
    id: [0, 0],
    hash: "",
    betValue: ["100", "100"],
    betPlaceStatus: ["none", "none"],
    cashingStatus: ["none", "none"],
    cashStarted: [false, false],
    pendingBet: [false, false],
    autoCashVal: ["1.45", "1.45"],
    enabledAutoCashOut: [false, false],
    stake: {
        max: 10000,
        min: 100
    },
}

// Define the function for the curve
export const curveFunction = (x: number, dimension: dimensionType) => {
    return 0.0007 * Math.pow(x, 1.9) * dimension.height / 1500
};


export const renderCurve = (g: Graphics, _dimension: dimensionType) => {
    const dimension = { width: _dimension.width, height: _dimension.height - 40 }
    const xAxis = Array.from({ length: dimension.width / 10 }, (_, index) => index * 10)
    const points = xAxis.map(item => ({ x: item, y: dimension.height - curveFunction(item, dimension) }));
    g.clear()
    g.beginFill(0xE59407, 0.3);
    // g.lineStyle(4, 0xffd900, 1);
    g.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
    }
    g.lineTo(points[points.length - 1].x, dimension.height);
    g.lineTo(0, dimension.height);
    g.endFill();
    const lineWidth = interpolate(window.innerWidth, 400, 1920, 16, 4)
    g.lineStyle(lineWidth, 0xffd900, 1);
    g.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
    }
}
export const _drawOuterBoundery = (g: Graphics, dimension: dimensionType) => {


    g.clear()

    g.lineStyle(2, 0x2A2A2E, 1);
    g.drawRoundedRect(0, 0, dimension.width, dimension.height, 10)

}
export const _drawInnerBoundery = (g: Graphics, dimension: dimensionType) => {


    g.clear()

    g.lineStyle(2, 0x2A2A2E, 1);
    g.moveTo(40, 0)
    g.lineTo(40, dimension.height - 40)
    g.lineTo(dimension.width, dimension.height - 40)

}


export const createGradTexture = (dimension: dimensionType) => {
    const canvas = document.createElement('canvas');

    canvas.width = dimension.width / 2;
    canvas.height = dimension.height;
    const r = Math.min(dimension.width, dimension.height)
    const ctx = canvas.getContext('2d');

    if (ctx) {
        const grd = ctx.createRadialGradient(dimension.width / 4, dimension.height / 2, r / 8, dimension.width / 4, dimension.height / 2, r / 2);
        // radial - gradient(circle, rgba(86, 0, 152, 1) 0 %, rgba(41, 0, 73, 1) 100 %)
        grd.addColorStop(0, '#E5940744');
        grd.addColorStop(1, '#00000044');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, dimension.width / 2, dimension.height);
    }

    return Texture.from(canvas);
}
export const maskDraw = (g: Graphics, dimension: dimensionType) => {
    g.beginFill(0xff0000);
    g.drawRect(0, 0, dimension.width, dimension.height);
    g.endFill();
}

export const smoothen = (t: number, dimension: dimensionType) => (Math.sin(Math.PI * t / (2 * dimension.width)) * dimension.width)

export const _drawBar = (width: number, color: ColorSource) => (g: Graphics) => {
    g.clear()
    g.beginFill(color, 1)
    g.drawRoundedRect(0, 0, width, 20, 10)
    g.endFill()

}

export const playSound = (type: 'bg' | 'flew' | 'win' | 'take') => {
    let status = '';
    switch (type) {
        case 'bg':
            status = localStorage.getItem('music') || 'true'
            break;
        case 'flew':
        case 'win':
        case 'take':
            status = localStorage.getItem('fx') || 'true'
            break;
    }
    if (status === 'true')
        sound.play(`${type}-sound`, { loop: type === 'bg' });
}
export const stopSound = (type: 'bg' | 'flew' | 'win' | 'take') => {
    sound.stop(`${type}-sound`)
}

export const loadSound = () => {
    sound.add('bg-sound', `${process.env.REACT_APP_ASSETS_IMAGE_URL}general/sound/bg-sound.mp3`);
    sound.add('flew-sound', `${process.env.REACT_APP_ASSETS_IMAGE_URL}general/sound/flew.mp3`);
    sound.add('win-sound', `${process.env.REACT_APP_ASSETS_IMAGE_URL}general/sound/win.mp3`);
    sound.add('take-sound', `${process.env.REACT_APP_ASSETS_IMAGE_URL}general/sound/take.mp3`);
    sound.volumeAll = 0.5

}
export const setVolume = (val: number) => {
    sound.volumeAll = val / 100
}

export const openFullscreen = async () => {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        try {
            await elem.requestFullscreen();
        } catch (e) { }
    }
    // else if (elem.webkitRequestFullscreen) { /* Safari */
    //     elem.webkitRequestFullscreen();
    // } else if (elem.msRequestFullscreen) { /* IE11 */
    //     elem.msRequestFullscreen();
    // }
}

/* Close fullscreen */
export const closeFullscreen = async () => {
    if (document.exitFullscreen) {
        try {
            await document.exitFullscreen();
        } catch (e) { }

    }
    // else if (document.webkitExitFullscreen) { /* Safari */
    //     document.webkitExitFullscreen();
    // } else if (document.msExitFullscreen) { /* IE11 */
    //     document.msExitFullscreen();
    // }
}

export function interpolate(x: number, x1: number, x2: number, y1: number, y2: number) {
    return Math.max(Math.min(y1, y2), Math.min(Math.max(y1, y2), (y2 - y1) * (x - x1) / (x2 - x1) + y1))
}

export function getHistoryItemColor(_val: string) {
    const val = parseFloat(_val.substring(0, _val.length - 1))
    if (val < 2) return "#07BDE5"
    else if (val < 10) return "#913EF8"
    else return "#C017B4"
}
export const testMobile = () => {
    if (/Mobi/i.test(navigator.userAgent) || /Macintosh/i.test(navigator.userAgent)) {
        console.log("This is a mobile device");
        if (/iPhone/i.test(navigator.userAgent)) {
            console.log("This is an iPhone");
            return {
                mobile: true,
                iPhone: true
            }
        } else if (/iPad/i.test(navigator.userAgent)) {
            console.log("This is an iPad");
            return {
                mobile: true,
                iPhone: true
            }
        } else if (/Macintosh/i.test(navigator.userAgent)) {
            console.log("This is a Macintosh");
            return {
                mobile: true,
                iPhone: true
            }
        } else {
            return {
                mobile: true,
                iPhone: false
            }
        }
    } else {
        console.log("This is a browser");
        return {
            mobile: false,
            iPhone: false
        }
    }
}
export const showToast = (msg: string, type: "error" | "info" = "error") => {
    const params = {
        position: "top-right" as ToastPosition,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored" as Theme,
    }
    if (type === "error") {
        toast.error(msg, params);
    } else {
        toast.info(msg, params)
    }
}
export const setStateTemplate = (val: any, i: number) => (prev: any[]) => {
    const new_val = [...prev]
    new_val[i] = val
    return new_val
}
export const getUTCTimefromUTCTime: (timeString: string) => Date = (timeString: string) => {
    if (!timeString) return new Date()
    const modifiedTimeString = timeString.replace(' ', 'T');
    const date = new Date(modifiedTimeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    date.setHours(hours - 5);
    date.setMinutes(minutes - 30 - date.getTimezoneOffset());
    return date;
}
export const doDelay = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec))
export const initBet6 = JSON.parse(localStorage.getItem(`bet6`) || '["100","200","300","400","500","600"]')
export const webpORpng = utils.isWebGLSupported() ? "webp" : "png"