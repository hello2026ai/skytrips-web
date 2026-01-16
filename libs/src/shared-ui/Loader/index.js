import './style.scss';
import { useEffect, useState } from 'react';

const flightFacts = [
    "The world’s longest flight is from Singapore to New York, covering 9,537 miles in about 18.5 hours!",
    "The shortest commercial flight is just 1.7 miles between Westray and Papa Westray in Scotland—it takes under 2 minutes!",
    "At any given time, around 9,700 planes are flying worldwide, carrying over 1.2 million passengers!",
    "The busiest airport in the world is Atlanta (ATL), handling over 100 million passengers annually!",
    "The most expensive first-class ticket? Etihad Airways’ “The Residence” suite costs around $64,000 one-way!",
    "The fastest commercial flight ever recorded was by the Concorde, traveling from New York to London in just 2 hours 52 minutes!",
    "The longest airline delay was 18 hours, when passengers were stranded in Beijing due to a snowstorm!",
    "The world’s most remote airport? Mataveri Airport on Easter Island, over 2,336 miles from the nearest airport!",
    "Qantas once flew a record-breaking 19-hour non-stop flight from New York to Sydney in a test for future ultra-long-haul travel.",
    "Boeing 747s have flown more than 3.5 billion people, roughly half of the world’s population!",
    "On average, planes get struck by lightning once per year, but they are designed to handle it safely!",
    "The safest seat on a plane? Studies show that middle seats in the back rows have the highest survival rate in accidents.",
    "Airplane oxygen masks only provide about 15 minutes of oxygen, but that’s enough for pilots to descend to a safe altitude.",
    "The world’s busiest airline route is between Seoul and Jeju Island, with over 14 million passengers annually!",
    "Pilots and co-pilots are required to eat different meals to prevent food poisoning from affecting both at the same time!"
];

export const LoadingScreen = ({ progress, originLocationCity, destinationLocationCity }) => {
    const [randomFact, setRandomFact] = useState("");

    useEffect(() => {
        setRandomFact(flightFacts[Math.floor(Math.random() * flightFacts.length)]);
    }, []);

    return (
        <div className="loading-container">
            <h4>Searching flights from {originLocationCity} to {destinationLocationCity}</h4>
            <p>Finding the best fares for you...</p>
            <p className="progress-text">Loading: {progress}% complete</p>
            <div className="progress-bar-container mb-4">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <p><i className="bi bi-tag-fill i-custom-color"></i> Looking for hidden deals and discounts</p>
            <p><i className="bi bi-globe2 i-custom-color"></i> Checking for 500+ airlines worldwide</p>
            {randomFact && (
                <div className="info-box">
                    <strong>Did you know?</strong>
                    <p><span className="icon">💡</span> {randomFact}</p>
                </div>
            )}
        </div>
    );
};