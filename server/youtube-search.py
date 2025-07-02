#!/usr/bin/env python3
import sys
import json
import httpx
from youtubesearchpython import VideosSearch

def search_youtube(query, limit=10):
    """Search YouTube videos using youtube-search-python"""
    try:
        videos_search = VideosSearch(query, limit=limit)
        results = videos_search.result()
        
        formatted_results = []
        for video in results['result']:
            formatted_results.append({
                'videoId': video['id'],
                'title': video['title'],
                'artist': video['channel']['name'],
                'thumbnail': video['thumbnails'][0]['url'] if video['thumbnails'] else '',
                'duration': video['duration'] if video['duration'] else '0:00'
            })
        
        return {
            'success': True,
            'results': formatted_results
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_location_from_ip(ip_address=None):
    """Get location information from IP address using httpx"""
    try:
        with httpx.Client() as client:
            if ip_address:
                response = client.get(f'https://ipapi.co/{ip_address}/json/')
            else:
                response = client.get('https://ipapi.co/json/')
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'location': {
                        'city': data.get('city', ''),
                        'country': data.get('country_name', ''),
                        'countryCode': data.get('country_code', ''),
                        'region': data.get('region', '')
                    }
                }
            else:
                return {
                    'success': False,
                    'error': f'API request failed with status {response.status_code}'
                }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_trending_music_by_location(country_code, limit=20):
    """Get trending music based on location"""
    try:
        # Search for popular music with location-specific terms
        location_queries = [
            f"popular music {country_code}",
            f"trending songs {country_code}",
            "top hits 2024",
            "popular music today"
        ]
        
        all_results = []
        for query in location_queries:
            videos_search = VideosSearch(query, limit=limit//len(location_queries))
            results = videos_search.result()
            
            for video in results['result']:
                all_results.append({
                    'videoId': video['id'],
                    'title': video['title'],
                    'artist': video['channel']['name'],
                    'thumbnail': video['thumbnails'][0]['url'] if video['thumbnails'] else '',
                    'duration': video['duration'] if video['duration'] else '0:00'
                })
        
        return {
            'success': True,
            'results': all_results[:limit]
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No command provided'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == 'search':
            if len(sys.argv) < 3:
                print(json.dumps({'success': False, 'error': 'No search query provided'}))
                sys.exit(1)
            query = sys.argv[2]
            limit = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            result = search_youtube(query, limit)
            print(json.dumps(result))
        
        elif command == 'location':
            ip_address = sys.argv[2] if len(sys.argv) > 2 else None
            result = get_location_from_ip(ip_address)
            print(json.dumps(result))
        
        elif command == 'trending':
            if len(sys.argv) < 3:
                print(json.dumps({'success': False, 'error': 'No country code provided'}))
                sys.exit(1)
            country_code = sys.argv[2]
            limit = int(sys.argv[3]) if len(sys.argv) > 3 else 20
            result = get_trending_music_by_location(country_code, limit)
            print(json.dumps(result))
        
        else:
            print(json.dumps({'success': False, 'error': f'Unknown command: {command}'}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
