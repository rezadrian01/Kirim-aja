import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenCageService {
    async geocode(address: string): Promise<{ lat: number; lng: number }> {
        const apiKey = process.env.OPENCAGE_API_KEY;
        if (!apiKey) {
            console.error(
                'OpenCage API key is not set in environment variables.',
            );
            throw new BadRequestException('OpenCage API key is missing');
        }

        try {
            const response = await axios.get(
                'https://api.opencagedata.com/geocode/v1/json',
                {
                    params: {
                        key: apiKey,
                        q: address,
                        limit: 1,
                    },
                },
            );

            const result = response.data.results?.[0];
            if (!result) {
                throw new BadRequestException('No geocoding results found');
            }

            return {
                lat: result.geometry.lat,
                lng: result.geometry.lng,
            };
        } catch (error) {
            console.error(
                'Error occurred while fetching geocoding data:',
                error,
            );
            throw new BadRequestException('Geocoding service is unavailable.');
        }
    }
}
