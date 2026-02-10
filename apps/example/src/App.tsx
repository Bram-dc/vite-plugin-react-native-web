import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

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

			<h1>Vite + React</h1>
			<View style={styles.card}>
				<Pressable onPress={() => setCount((count) => count + 1)} style={styles.button}>
					<Text style={styles.buttonText}>count is {count}</Text>
				</Pressable>

				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</View>

			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
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
