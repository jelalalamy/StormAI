export default class apiService{
    static finishStory(prompt) {
        const payload = {
            "inputs": prompt,
            "parameters": {
                "temperature": 1,
                "min_length": 25,
                "max_new_tokens": 50,
                "return_full_text": true,
                "do_sample": false,
                "seed": 10,
                "early_stopping": false,
                "length_penalty": 0.0
            },
            "options": {
                "use_cache": true,
                "wait_for_model": false
            }
        }

        return fetch(`${process.env.REACT_APP_STORY_BOT_SERVER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${process.env.REACT_APP_HUGGINGFACE_TOKEN}`
            },
            body: JSON.stringify(payload)
        }).then((response) =>{
            return response.json();
        });
    }

    static generateImage(prompt){
        return fetch(`${process.env.REACT_APP_ARTIST_BOT_SERVER}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer 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`
            },
            body: JSON.stringify(prompt)
        }).then((response) =>{
            return response.blob();
        })
    }
}