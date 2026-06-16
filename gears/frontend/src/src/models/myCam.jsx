export function MyCam({source})
{
	return (
		<div style = {styles.cam}>
			<iframe src={source} style={styles.iframe} allow="autoplay"/>
		</div>
	)
}

const styles = {
	cam : {
	position: 'relative', 
	paddingBottom: '56.25%', // Ratio 16:9
	height: 0, 
	overflow: 'hidden',
	borderRadius: '12px',
	boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
	},
	iframe: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		border: 'none'
	},
}