export  const getRandomColor = () => {
    const colors = ['#4F6EF7', '#38BDF8', '#8B5CF6', '#EC4899', '#22C55E', '#F59E0B', '#EF4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
