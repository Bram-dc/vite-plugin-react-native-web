import { createStaticNavigation, Link, type StaticParamList, type StaticScreenProps } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const posts = [
	{ id: '1', title: 'Rendered on the server', body: 'Open the page source: this text is already in the HTML.' },
	{ id: '2', title: 'Hydrated in the browser', body: 'React Native Web reuses the server stylesheet and markup.' },
]

const HomeScreen = () => {
	const [count, setCount] = useState(0)

	return (
		<View style={styles.screen}>
			<Text role="heading" style={styles.title}>
				Vite + React Native Web + SSR
			</Text>
			<Pressable role="button" onPress={() => setCount((count) => count + 1)} style={styles.button}>
				<Text style={styles.buttonText}>count is {count}</Text>
			</Pressable>
			{posts.map((post) => (
				<Link key={post.id} screen="Post" params={{ id: post.id }} style={styles.link}>
					{post.title}
				</Link>
			))}
		</View>
	)
}

const PostScreen = ({ route }: StaticScreenProps<{ id: string }>) => {
	const post = posts.find((post) => post.id === route.params.id)

	return (
		<View style={styles.screen}>
			<Text role="heading" style={styles.title}>
				{post?.title ?? 'Post not found'}
			</Text>
			{post && <Text style={styles.body}>{post.body}</Text>}
			<Link screen="Home" style={styles.link}>
				Back home
			</Link>
		</View>
	)
}

const RootStack = createNativeStackNavigator({
	screenOptions: { headerShown: false },
	screens: {
		Home: { screen: HomeScreen, linking: '', options: { title: 'Home' } },
		Post: { screen: PostScreen, linking: 'posts/:id', options: { title: 'Post' } },
	},
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}

const Navigation = createStaticNavigation(RootStack)

const App = () => <Navigation linking={{ enabled: 'auto', prefixes: [] }} />

export default App

const styles = StyleSheet.create({
	screen: {
		alignItems: 'center',
		gap: 16,
		padding: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	body: {
		fontSize: 16,
	},
	button: {
		backgroundColor: '#1E1E1E',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		userSelect: 'none',
	},
	buttonText: {
		color: 'white',
	},
	link: {
		color: '#646CFF',
		fontSize: 16,
	},
})
