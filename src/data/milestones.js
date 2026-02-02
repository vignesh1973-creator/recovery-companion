const FALLBACK_VIDEOS = [
    { videoId: 'mgmVOuLgFB0', title: 'WHY DO WE FALL' },
    { videoId: '9t6J-hKqJMs', title: 'DISCIPLINE IS FREEDOM' },
    { videoId: 'hb7qydF4b-s', title: 'THE MINDSET OF A WINNER' },
    { videoId: '5f-wQBh-2xM', title: 'NEVER GIVE UP' }
];

const DEFINED_MILESTONES = [
    {
        day: 5,
        type: 'alien',
        name: 'HEATBLAST',
        img: '/assets/heatblast.png',
        quote: "I'm on fire! Absolute focus is the only way to control the burn."
    },
    {
        day: 7,
        type: 'video',
        videoId: 'mgmVOuLgFB0',
        title: 'MENTAL FORTITUDE'
    },
    {
        day: 10,
        type: 'alien',
        name: 'FOUR ARMS',
        img: '/assets/heatblast.png', // Uses Heatblast asset until FourArms is generated
        quote: "Strength is not just muscle. It is the will to keep holding on."
    },
    {
        day: 14,
        type: 'video',
        videoId: '9t6J-hKqJMs',
        title: 'UNBREAKABLE WILL'
    },
    {
        day: 15,
        type: 'alien',
        name: 'XLR8',
        img: '/assets/heatblast.png',
        quote: "Speed requires decision. Hesitation is the enemy."
    }
];

export const getMilestone = (streak) => {
    // 1. Check if we have a manually defined milestone for this day
    const exactMatch = DEFINED_MILESTONES.find(m => m.day === streak);
    if (exactMatch) return exactMatch;

    // 2. Procedural Generation for Future Days
    // Every 5 Days: Alien (Cycle through placeholders if not defined)
    if (streak % 5 === 0) {
        return {
            day: streak,
            type: 'alien',
            name: `OMNITRIX UNLOCK #${streak / 5}`,
            img: '/assets/heatblast.png', // Fallback image
            quote: "The Omnitrix honors your consistency."
        };
    }

    // Every 7 Days: Video (Random from Pool)
    if (streak % 7 === 0) {
        const randomVideo = FALLBACK_VIDEOS[Math.floor(Math.random() * FALLBACK_VIDEOS.length)];
        return {
            day: streak,
            type: 'video',
            videoId: randomVideo.videoId,
            title: randomVideo.title
        };
    }

    return null;
};
