import { useState } from 'react';
import { subscribeUserToPush } from '../utils/webpush';

export function PushButton() {
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleEnablePush = async () => {
		setLoading(true);
		try {
			await subscribeUserToPush();
			setIsSubscribed(true);
			alert('Notifications activées avec succès !');
		} 
		catch (error) 
		{
			console.error(error);
			alert(error.message);
		} 
		finally {setLoading(false);}
	};

	return (
		<button 
		onClick={handleEnablePush} 
		disabled={loading || isSubscribed}
		style={{
			padding: '0.6rem 1.2rem',
			borderRadius: '8px',
			backgroundColor: isSubscribed ? '#10B981' : '#3B82F6',
			color: 'white',
			border: 'none',
			cursor: 'pointer'
		}}
		>
		{loading ? 'Activation...' : isSubscribed ? '🔔 Notifications actives' : '🔔 Activer les notifications'}
		</button>
	);
}