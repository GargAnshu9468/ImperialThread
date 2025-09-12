import { View } from 'react-native';
import React from 'react';

const Dot = ({ active }: { active: boolean }) => (
    <View
        style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
            opacity: active ? 1 : 0.3,
            backgroundColor: '#fff',
        }}
    />
);

export default function Dots({ total, index }: { total: number; index: number }) {
    return (
        <View style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 8 }}>
            {Array.from({ length: total }).map((_, i) => (
                <Dot key={i} active={i === index} />
            ))}
        </View>
    );
}
