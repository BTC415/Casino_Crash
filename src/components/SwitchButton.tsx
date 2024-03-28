import * as React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 40,
    height: 20,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(18px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 14,
        height: 14,
        borderRadius: 7,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
        transform: 'translateX(2px) translateY(1px)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 20 / 2,
        opacity: 1,
        backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.25)',
        boxSizing: 'border-box',
        borderWidth: 1,
        borderColor: "#ffffff44"
    },
}));

export default function SwitchButton({ checked, onChange, disabled }: { checked: boolean, onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void, disabled: boolean }) {
    return (
        <AntSwitch checked={checked} disabled={disabled} onChange={onChange} inputProps={{ 'aria-label': 'ant design' }} />
    );
}