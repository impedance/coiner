import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: Colors.card,
                    borderTopColor: Colors.border,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Buckets',
                    tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    title: 'Goals',
                    tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="review"
                options={{
                    title: 'Review',
                    tabBarIcon: ({ color }) => <Ionicons name="checkmark-circle" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="behavior"
                options={{
                    title: 'Behavior',
                    tabBarIcon: ({ color }) => <Ionicons name="fitness" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
