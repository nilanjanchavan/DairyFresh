import React from 'react'
import { useState } from 'react'

function AboutPage(props) {
    var isDarkMode = props.isDarkMode

    var faqState = useState(-1)
    var openFaqIndex = faqState[0]
    var setOpenFaqIndex = faqState[1]

    var features = [
        { emoji: '🥛', title: '100% Pure', description: 'No additives or preservatives' },
        { emoji: '🚚', title: 'Daily Delivery', description: 'Fresh products every morning' },
        { emoji: '🐄', title: 'Happy Cows', description: 'Ethical farming practices' },
        { emoji: '🌱', title: 'Organic', description: 'Certified organic products' },
        { emoji: '❄️', title: 'Cold Chain', description: 'Maintained freshness' },
        { emoji: '✅', title: 'Quality Tested', description: 'Lab certified products' }
    ]

    var founders = [
        { name: 'Tarun Kumar', id: 'LCS2025031', role: 'Lead Developer' },
        { name: 'Aradhaya Verma', id: 'LIT2025050', role: 'UI/UX Designer' },
        { name: 'Shambhavi Verma', id: 'LCS2025030', role: 'Backend Developer' },
        { name: 'Saksham Singhal', id: 'LIT2025055', role: 'Frontend Developer' },
        { name: 'Aviral Sonkar', id: 'LIT2025007', role: 'Database Engineer' },
        { name: 'Nilanjan Chavan', id: 'LCS2025059', role: 'DevOps Engineer' }
    ]

    var galleryImages = [
        { src: '/images/gallery-1.jpg', darkSrc: '/images/gallery-1_dark.jpg', alt: 'Gallery 1' },
        { src: '/images/gallery-2.jpg', darkSrc: '/images/gallery-2_dark.jpg', alt: 'Gallery 2' },
        { src: '/images/gallery-3.jpg', darkSrc: '/images/gallery-3_dark.jpg', alt: 'Gallery 3' }
    ]

    var timeline = [
        { year: '1995', event: 'DairyFresh founded with a single farm', icon: '🏠' },
        { year: '2005', event: 'Expanded to 10 farms across the region', icon: '📈' },
        { year: '2015', event: 'Launched organic product line', icon: '🌱' },
        { year: '2020', event: 'Started home delivery service', icon: '🚚' },
        { year: '2024', event: 'Serving 10,000+ happy customers', icon: '🎉' }
    ]

    var aboutFaqs = [
        {
            question: 'Where are your farms located?',
            answer: 'Our farms are located in the lush green valleys of North India, where the climate and environment are perfect for dairy farming. We have multiple farms spread across different regions to ensure a consistent supply of fresh products.'
        },
        {
            question: 'How do you ensure quality?',
            answer: 'Every batch of our products goes through rigorous quality testing in our state-of-the-art laboratory. We test for purity, freshness, and nutritional content. Our cold chain logistics ensure products reach you in perfect condition.'
        },
        {
            question: 'Are your farming practices sustainable?',
            answer: 'Yes! We follow sustainable farming practices including solar-powered facilities, water recycling, and organic waste composting. Our cows are treated ethically with ample space, nutritious food, and regular veterinary care.'
        },
        {
            question: 'Can I visit your farms?',
            answer: 'Absolutely! We offer farm tours for our subscribers. You can see firsthand how we maintain quality and care for our animals. Contact us to schedule a visit!'
        }
    ]

    var awards = [
        { icon: '🏆', title: 'Best Dairy Brand 2023', org: 'India Food Awards' },
        { icon: '🌟', title: 'Quality Excellence', org: 'FSSAI Certified' },
        { icon: '🌿', title: 'Organic Certified', org: 'India Organic' },
        { icon: '💚', title: 'Sustainable Farm', org: 'Green Initiative' }
    ]

    function handleFaqClick(index) {
        if (openFaqIndex === index) {
            setOpenFaqIndex(-1)
        } else {
            setOpenFaqIndex(index)
        }
    }

    return (
        <div className="main-content">
            <div className="about-section">
                <h1>About DairyFresh</h1>
                <p>Since 1995, DairyFresh has been delivering the finest dairy products directly from our farms to your home. We believe in pure, natural, and sustainable dairy farming.</p>

                <div className="why-choose-section" style={{ margin: '30px 0' }}>
                    <h2>Our Achievements</h2>
                    <div className="why-choose-grid">
                        {awards.map(function (award, index) {
                            return (
                                <div key={index} className="why-choose-card">
                                    <div className="why-choose-icon">{award.icon}</div>
                                    <h3>{award.title}</h3>
                                    <p>{award.org}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <h2>Our Founders</h2>
                <div className="cards-grid" style={{ marginBottom: '30px' }}>
                    {founders.map(function (founder, index) {
                        return (
                            <div key={index} className="card" style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #2ecc71, #228b22)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 15px',
                                    fontSize: '30px',
                                    color: 'white'
                                }}>
                                    👤
                                </div>
                                <h3>{founder.name}</h3>
                                <p style={{ color: '#2ecc71', marginBottom: '5px' }}>{founder.role}</p>
                                <p style={{ fontSize: '12px', opacity: 0.7 }}>{founder.id}</p>
                            </div>
                        )
                    })}
                </div>

                <h2>Our Journey</h2>
                <div className="timeline-section" style={{ margin: '30px 0' }}>
                    {timeline.map(function (item, index) {
                        return (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '15px',
                                marginBottom: '10px',
                                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                borderRadius: '12px',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #2ecc71, #228b22)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ color: '#228b22' }}>{item.year}</h4>
                                    <p style={{ color: '#2ecc71', margin: 0 }}>{item.event}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <h2>Our Farm Story</h2>
                <p>Located in the lush green valleys, our family-owned farms have been producing premium quality dairy for generations. We maintain the highest standards of animal care and sustainable farming practices.</p>

                <div className="video-placeholder">
                    <video
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                        controls
                        loop
                    >
                        <source src="/videos/farm-tour.mp4" type="video/mp4" />
                        Your browser does not support video.
                    </video>
                </div>

                <h2>Why Choose DairyFresh?</h2>
                <div className="feature-grid">
                    {features.map(function (feature, index) {
                        return (
                            <div key={index} className="feature-card">
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>{feature.emoji}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        )
                    })}
                </div>

                <h2 style={{ marginTop: '30px' }}>Our Farms & Facilities</h2>
                <div className="cards-grid">
                    {galleryImages.map(function (image, index) {
                        var currentSrc = isDarkMode ? image.darkSrc : image.src
                        return (
                            <div key={index} className="image-placeholder">
                                <img
                                    src={currentSrc}
                                    alt={image.alt}
                                    className="product-img"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                                />
                            </div>
                        )
                    })}
                </div>

                <div className="faq-section" style={{ margin: '30px 0', background: 'transparent', boxShadow: 'none', padding: 0 }}>
                    <h2>Frequently Asked Questions</h2>
                    {aboutFaqs.map(function (faq, index) {
                        var questionClass = openFaqIndex === index ? 'faq-question active' : 'faq-question'
                        var answerClass = openFaqIndex === index ? 'faq-answer active' : 'faq-answer'
                        return (
                            <div key={index} className="faq-item">
                                <button className={questionClass} onClick={function () { handleFaqClick(index) }}>
                                    <span>{faq.question}</span>
                                    <span className="faq-icon">▼</span>
                                </button>
                                <div className={answerClass}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default AboutPage
