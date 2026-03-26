import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Today',
                    tabBarIcon: ({ color }) => <Ionicons name="today" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="plan"
                options={{
                    title: 'Plan',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
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
