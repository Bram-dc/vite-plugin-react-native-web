import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'
import { Image } from 'expo-image'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

function App() {
	const [count, setCount] = useState(0)

	return (
		<ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24 }}>
			<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
				<a href="https://vite.dev" target="_blank" rel="noopener">
					<View style={styles.logoWrapper}>
						<Image source={{ uri: viteLogo }} style={styles.logo} alt="Vite logo" />
					</View>
				</a>
				<a href="https://react.dev" target="_blank" rel="noopener">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</View>

			<h1>Vite + React + Expo</h1>
			<View style={styles.card}>
				<Pressable onPress={() => setCount((count) => count + 1)} style={styles.button}>
					<Text style={styles.buttonText}>count is {count}</Text>
				</Pressable>

				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</View>

			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>

			<h1>Expo Image</h1>
			<View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
				<Image
					source={{
						uri: 'https://reactnative.dev/img/tiny_logo.png',
					}}
					style={{ width: 64, height: 64 }}
				/>
				<Image
					source={{
						blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I',
					}}
					style={{ width: 64, height: 64 }}
				/>
			</View>
			<p>
				Above is an image rendered using Expo Image component. The first one is loaded from a URI, the second one is
				rendered using a blurhash.
			</p>
		</ScrollView>
	)
}

export default App

const styles = StyleSheet.create({
	logoWrapper: {
		padding: 24,
	},
	logo: {
		aspectRatio: 1,
		height: 96,
	},
	card: {
		padding: 32,
	},
	button: {
		backgroundColor: '#1E1E1E',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignSelf: 'center',
		userSelect: 'none',
	},
	buttonText: {
		color: 'white',
	},
})
