"""
backend/ml/evacuation_graph.py
Graph modeling and Dijkstra algorithm for dynamic, risk-aware evacuation route optimization.
Pure Python algorithm module (heapq-based) with terrain, slope, and real-time landslide risk weighting.
"""

from typing import Dict, Any, List, Optional, Tuple, Set
import math
import heapq
from datetime import datetime, timezone


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two GPS coordinates."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class Node:
    """A geographic waypoint, junction, zone centroid, or facility node."""
    def __init__(
        self,
        node_id: str,
        name: str,
        node_type: str,  # 'zone_centroid', 'shelter', 'hospital', 'junction', 'tourist_spot'
        lat: float,
        lon: float,
        zone_id: Optional[str] = None,
        capacity: Optional[int] = None,
        contact: Optional[str] = None
    ):
        self.node_id = node_id
        self.name = name
        self.node_type = node_type
        self.lat = lat
        self.lon = lon
        self.zone_id = zone_id
        self.capacity = capacity
        self.contact = contact

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "name": self.name,
            "node_type": self.node_type,
            "lat": self.lat,
            "lon": self.lon,
            "zone_id": self.zone_id,
            "capacity": self.capacity,
            "contact": self.contact
        }


class Edge:
    """A directed road segment connecting two nodes with terrain and risk attributes."""
    def __init__(
        self,
        edge_id: str,
        u: str,
        v: str,
        road_name: str,
        road_type: str,  # 'national_highway', 'state_highway', 'district_road', 'evacuation_corridor'
        distance_km: float,
        slope_deg: float,
        zone_id: str,
        waypoints: List[List[float]],  # [[lat, lon], ...]
        is_blocked: bool = False,
        blockage_reason: str = ""
    ):
        self.edge_id = edge_id
        self.u = u
        self.v = v
        self.road_name = road_name
        self.road_type = road_type
        self.distance_km = distance_km
        self.slope_deg = slope_deg
        self.zone_id = zone_id
        self.waypoints = waypoints
        self.is_blocked = is_blocked
        self.blockage_reason = blockage_reason

    def to_dict(self) -> Dict[str, Any]:
        return {
            "edge_id": self.edge_id,
            "u": self.u,
            "v": self.v,
            "road_name": self.road_name,
            "road_type": self.road_type,
            "distance_km": self.distance_km,
            "slope_deg": self.slope_deg,
            "zone_id": self.zone_id,
            "is_blocked": self.is_blocked,
            "blockage_reason": self.blockage_reason,
            "waypoints": self.waypoints
        }


class EvacuationGraph:
    """
    Weighted road network graph for East Khasi Hills evacuation corridors.
    Implements Dijkstra's algorithm with dynamic penalty weights:
      Weight = alpha * distance_km
             + beta * risk_penalty(zone_risk_level)
             + gamma * terrain_penalty(slope_deg)
             + delta * blockage_penalty (inf if blocked)
    """

    def __init__(self, alpha: float = 1.0, beta: float = 0.5, gamma: float = 0.3):
        self.alpha = alpha  # Distance coefficient
        self.beta = beta    # Risk penalty coefficient
        self.gamma = gamma  # Terrain slope coefficient

        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, Edge] = {}
        self.adjacency: Dict[str, List[Tuple[str, Edge]]] = {}

        # Real-time risk data cache: zone_id -> {"risk_score": float, "risk_level": str}
        self.zone_risks: Dict[str, Dict[str, Any]] = {}

        # Road blockage registry: road_name or edge_id -> reason
        self.blockages: Dict[str, str] = {}

        # Populate default nodes and road corridors for East Khasi Hills
        self.build_default_graph()

    def add_node(self, node: Node) -> None:
        """Add a node to the graph."""
        self.nodes[node.node_id] = node
        if node.node_id not in self.adjacency:
            self.adjacency[node.node_id] = []

    def add_edge(self, edge: Edge, bidirectional: bool = True) -> None:
        """Add a directed or bidirectional edge to the graph."""
        self.edges[edge.edge_id] = edge
        self.adjacency.setdefault(edge.u, []).append((edge.v, edge))

        if bidirectional:
            rev_edge_id = f"{edge.edge_id}_rev"
            rev_waypoints = list(reversed(edge.waypoints))
            rev_edge = Edge(
                edge_id=rev_edge_id,
                u=edge.v,
                v=edge.u,
                road_name=edge.road_name,
                road_type=edge.road_type,
                distance_km=edge.distance_km,
                slope_deg=edge.slope_deg,
                zone_id=edge.zone_id,
                waypoints=rev_waypoints,
                is_blocked=edge.is_blocked,
                blockage_reason=edge.blockage_reason
            )
            self.edges[rev_edge_id] = rev_edge
            self.adjacency.setdefault(edge.v, []).append((edge.u, rev_edge))

    def update_zone_risks(self, risks: Dict[str, Dict[str, Any]]) -> None:
        """Update live or simulated zone landslide risk scores and levels."""
        self.zone_risks.update(risks)

    def set_road_blockage(self, road_identifier: str, blocked: bool = True, reason: str = "") -> int:
        """
        Mark road segments matching edge_id, road_name, or partial name as blocked or cleared.
        Returns number of segments affected.
        """
        if blocked:
            self.blockages[road_identifier] = reason or "Landslide debris blockage"
        else:
            self.blockages.pop(road_identifier, None)

        affected = 0
        target = road_identifier.strip().lower()
        for edge in self.edges.values():
            if (target in edge.edge_id.lower() or 
                target in edge.road_name.lower()):
                edge.is_blocked = blocked
                edge.blockage_reason = reason if blocked else ""
                affected += 1
        return affected

    def clear_all_blockages(self) -> None:
        """Reset all blocked road segments."""
        self.blockages.clear()
        for edge in self.edges.values():
            edge.is_blocked = False
            edge.blockage_reason = ""

    def get_risk_penalty(self, zone_id: str) -> float:
        """
        Map zone risk level to a numerical routing penalty:
          Low (0-39): 0.0
          Medium (40-59): 2.0
          High (60-79): 5.0
          Critical (80-100): 15.0
        """
        risk_data = self.zone_risks.get(zone_id, {})
        level = risk_data.get("risk_level", "Medium")
        score = risk_data.get("risk_score", 45.0)

        if level == "Critical" or score >= 80.0:
            return 15.0
        elif level == "High" or score >= 60.0:
            return 5.0
        elif level == "Medium" or score >= 40.0:
            return 2.0
        return 0.0

    def calculate_edge_cost(self, edge: Edge, temporary_penalties: Optional[Dict[str, float]] = None) -> float:
        """
        Calculate the total traversal cost of an edge based on:
        Cost = alpha * distance_km + beta * risk_penalty + gamma * (slope_deg / 10.0)
        Returns math.inf if the edge is blocked.
        """
        if edge.is_blocked:
            return math.inf

        # Check if the whole road name is in active blockages
        for blocked_key in self.blockages:
            if blocked_key.lower() in edge.road_name.lower() or blocked_key.lower() in edge.edge_id.lower():
                return math.inf

        dist_cost = self.alpha * edge.distance_km
        risk_pen = self.beta * self.get_risk_penalty(edge.zone_id)
        terrain_pen = self.gamma * (edge.slope_deg / 10.0)

        temp_pen = (temporary_penalties or {}).get(edge.edge_id, 0.0)

        return dist_cost + risk_pen + terrain_pen + temp_pen

    def find_nearest_node(self, lat: float, lon: float, allowed_types: Optional[List[str]] = None) -> Optional[Node]:
        """Find the closest graph node to a given GPS coordinate using Haversine distance."""
        min_dist = float("inf")
        nearest = None

        for node in self.nodes.values():
            if allowed_types and node.node_type not in allowed_types:
                continue
            dist = haversine_km(lat, lon, node.lat, node.lon)
            if dist < min_dist:
                min_dist = dist
                nearest = node

        return nearest

    def dijkstra_to_targets(
        self,
        origin_id: str,
        target_ids: Set[str],
        temporary_penalties: Optional[Dict[str, float]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Run Dijkstra's shortest path algorithm from origin_id to all target_ids.
        Returns a dict mapping target_id -> {cost, path_nodes, path_edges}.
        """
        if origin_id not in self.nodes:
            return {}

        # Priority queue stores tuples: (cumulative_cost, current_node_id, [edge_objects], [node_ids])
        pq: List[Tuple[float, str, List[Edge], List[str]]] = [(0.0, origin_id, [], [origin_id])]
        visited_costs: Dict[str, float] = {origin_id: 0.0}
        best_routes: Dict[str, Dict[str, Any]] = {}

        targets_remaining = set(target_ids)

        while pq and targets_remaining:
            cost, u, edges_so_far, nodes_so_far = heapq.heappop(pq)

            if cost > visited_costs.get(u, float("inf")):
                continue

            if u in targets_remaining:
                best_routes[u] = {
                    "cost": cost,
                    "edges": edges_so_far,
                    "nodes": nodes_so_far
                }
                targets_remaining.remove(u)

            for v, edge in self.adjacency.get(u, []):
                edge_cost = self.calculate_edge_cost(edge, temporary_penalties)
                if math.isinf(edge_cost):
                    continue  # Blocked or severed road

                new_cost = cost + edge_cost
                if new_cost < visited_costs.get(v, float("inf")):
                    visited_costs[v] = new_cost
                    heapq.heappush(pq, (new_cost, v, edges_so_far + [edge], nodes_so_far + [v]))

        return best_routes

    def plan_evacuation_routes(
        self,
        origin: Any,  # node_id (str) OR (lat, lon) tuple/dict
        target_category: str = "all",  # 'shelter', 'hospital', 'all'
        max_risk_threshold: float = 100.0,
        k: int = 3
    ) -> Dict[str, Any]:
        """
        Find top-k safest and fastest evacuation corridors from an origin to shelters/hospitals.
        Returns structured route objects with full XAI cost breakdown, waypoints, and avoided hazards.
        """
        # 1. Resolve Origin Node
        origin_node = None
        if isinstance(origin, str) and origin in self.nodes:
            origin_node = self.nodes[origin]
        elif isinstance(origin, (list, tuple)) and len(origin) >= 2:
            origin_node = self.find_nearest_node(float(origin[0]), float(origin[1]))
        elif isinstance(origin, dict) and "lat" in origin and "lon" in origin:
            origin_node = self.find_nearest_node(float(origin["lat"]), float(origin["lon"]))

        if not origin_node:
            raise ValueError(f"Origin '{origin}' could not be resolved to any graph node.")

        # 2. Collect Destination Targets
        target_nodes: List[Node] = []
        for n in self.nodes.values():
            if n.node_id == origin_node.node_id:
                continue
            if target_category == "shelter" and n.node_type == "shelter":
                target_nodes.append(n)
            elif target_category == "hospital" and n.node_type == "hospital":
                target_nodes.append(n)
            elif target_category == "all" and n.node_type in ["shelter", "hospital"]:
                target_nodes.append(n)

        target_ids = {n.node_id for n in target_nodes}

        # 3. Run Initial Dijkstra
        initial_routes = self.dijkstra_to_targets(origin_node.node_id, target_ids)

        if not initial_routes:
            return {
                "origin": origin_node.to_dict(),
                "paths": [],
                "algorithm": "dijkstra",
                "message": "No reachable shelters found. All arterial corridors are blocked by severe landslides.",
                "computed_at": datetime.now(timezone.utc).isoformat()
            }

        # Sort reachable targets by total Dijkstra cost
        ranked_targets = sorted(initial_routes.items(), key=lambda item: item[1]["cost"])

        # 4. Construct Top-K Distinct Evacuation Paths
        paths: List[Dict[str, Any]] = []
        collected_destinations: Set[str] = set()

        # Primary route (Rank 1)
        primary_target_id, primary_route = ranked_targets[0]
        primary_dest_node = self.nodes[primary_target_id]
        primary_path_data = self._build_path_details(
            rank=1,
            origin_node=origin_node,
            dest_node=primary_dest_node,
            route_info=primary_route
        )
        paths.append(primary_path_data)
        collected_destinations.add(primary_target_id)

        # Generate Rank 2: Alternative route to primary destination (Bypass), OR next best facility
        # Attempt to compute a distinct bypass to the primary destination using edge penalties
        primary_edge_ids = {e.edge_id for e in primary_route["edges"]}
        penalties = {eid: 12.0 for eid in primary_edge_ids}  # Penalize primary edges to force an alternate path

        bypass_routes = self.dijkstra_to_targets(
            origin_node.node_id,
            {primary_target_id},
            temporary_penalties=penalties
        )
        bypass_route = bypass_routes.get(primary_target_id)

        # Check if bypass is genuinely different (different edge sequence and not blocked)
        bypass_distinct = False
        if bypass_route and not math.isinf(bypass_route["cost"]):
            bypass_edge_ids = {e.edge_id for e in bypass_route["edges"]}
            if bypass_edge_ids != primary_edge_ids:
                bypass_distinct = True

        if bypass_distinct and len(paths) < k:
            bypass_path_data = self._build_path_details(
                rank=len(paths) + 1,
                origin_node=origin_node,
                dest_node=primary_dest_node,
                route_info=bypass_route,
                is_bypass=True
            )
            paths.append(bypass_path_data)

        # Add other ranked destinations to fill up to k
        for target_id, r_info in ranked_targets:
            if target_id in collected_destinations and bypass_distinct:
                continue
            if len(paths) >= k:
                break
            dest_node = self.nodes[target_id]
            path_data = self._build_path_details(
                rank=len(paths) + 1,
                origin_node=origin_node,
                dest_node=dest_node,
                route_info=r_info
            )
            paths.append(path_data)
            collected_destinations.add(target_id)

        # Re-number ranks 1, 2, ...
        for idx, p in enumerate(paths, start=1):
            p["rank"] = idx

        return {
            "origin": origin_node.to_dict(),
            "paths": paths,
            "total_paths": len(paths),
            "algorithm": "dijkstra",
            "weights_config": {
                "alpha_distance": self.alpha,
                "beta_risk": self.beta,
                "gamma_terrain": self.gamma
            },
            "active_blockages_count": len(self.blockages),
            "computed_at": datetime.now(timezone.utc).isoformat()
        }

    def _build_path_details(
        self,
        rank: int,
        origin_node: Node,
        dest_node: Node,
        route_info: Dict[str, Any],
        is_bypass: bool = False
    ) -> Dict[str, Any]:
        """Convert Dijkstra edges and nodes into user-facing route guidance with XAI breakdown."""
        edges: List[Edge] = route_info["edges"]
        nodes: List[str] = route_info["nodes"]
        cost: float = route_info["cost"]

        total_distance = sum(e.distance_km for e in edges)
        total_risk_penalty = sum(self.get_risk_penalty(e.zone_id) for e in edges)
        total_terrain_penalty = sum(e.slope_deg / 10.0 for e in edges)

        # Assemble unified polyline coordinates
        waypoints: List[List[float]] = [[origin_node.lat, origin_node.lon]]
        for e in edges:
            for pt in e.waypoints:
                if not waypoints or (waypoints[-1][0] != pt[0] or waypoints[-1][1] != pt[1]):
                    waypoints.append(pt)
        if waypoints[-1] != [dest_node.lat, dest_node.lon]:
            waypoints.append([dest_node.lat, dest_node.lon])

        # Distinct road segments
        road_segments = []
        for e in edges:
            if e.road_name not in road_segments:
                road_segments.append(e.road_name)

        # List avoided blocked roads in the pilot district
        avoided_blocked_segments = []
        for blocked_key, reason in self.blockages.items():
            avoided_blocked_segments.append(f"{blocked_key} ({reason})")

        # ETA calculations (average hill speed: 25 km/h driving, 3.5 km/h walking)
        # Add slight slope delay
        slope_factor = 1.0 + (total_terrain_penalty / max(1, len(edges)) * 0.08)
        drive_mins = max(3, int(round((total_distance / 25.0) * 60 * slope_factor)))
        walk_mins = max(10, int(round((total_distance / 3.5) * 60 * slope_factor)))

        # Safety rating: 100 base minus risk penalties
        safety_score = max(20, min(99, int(round(100.0 - total_risk_penalty * 3.2 - total_terrain_penalty * 1.5))))

        # Turn-by-turn steps
        steps = []
        for i, edge in enumerate(edges):
            u_name = self.nodes.get(edge.u, Node(edge.u, edge.u, "", 0, 0)).name
            v_name = self.nodes.get(edge.v, Node(edge.v, edge.v, "", 0, 0)).name
            step_desc = f"Follow {edge.road_name} ({edge.distance_km} km, avg slope {edge.slope_deg}°) from {u_name} towards {v_name}."
            steps.append({
                "step_number": i + 1,
                "road": edge.road_name,
                "distance_km": edge.distance_km,
                "instruction": step_desc,
                "slope_deg": edge.slope_deg,
                "zone_id": edge.zone_id
            })

        # Final shelter arrival step
        steps.append({
            "step_number": len(edges) + 1,
            "road": "Facility Access Gate",
            "distance_km": 0.1,
            "instruction": f"Arrive at {dest_node.name} ({dest_node.node_type.upper()}). Capacity: {dest_node.capacity or 'Ample'} persons.",
            "slope_deg": 5.0,
            "zone_id": dest_node.zone_id or "Safe Zone"
        })

        label = f"Primary Safe Corridor" if rank == 1 else (
            f"Alternative Bypass Route" if is_bypass else f"Backup Facility Corridor"
        )

        return {
            "rank": rank,
            "label": label,
            "is_bypass": is_bypass,
            "destination": dest_node.to_dict(),
            "destination_shelter": dest_node.name,
            "destination_type": dest_node.node_type,
            "total_cost": round(cost, 2),
            "distance_km": round(total_distance, 2),
            "risk_penalty": round(total_risk_penalty, 2),
            "terrain_penalty": round(total_terrain_penalty, 2),
            "safety_rating": safety_score,
            "safe": total_risk_penalty < 15.0 and not any(e.is_blocked for e in edges),
            "eta_minutes": {
                "drive": drive_mins,
                "walk": walk_mins
            },
            "waypoints": waypoints,
            "road_segments": road_segments,
            "blocked_segments_avoided": avoided_blocked_segments,
            "steps": steps
        }

    def to_geojson(self) -> Dict[str, Any]:
        """Export the road network graph as GeoJSON FeatureCollection for Leaflet map rendering."""
        features = []

        # 1. Road Edges as LineStrings
        seen_edges = set()
        for edge_id, edge in self.edges.items():
            base_id = edge_id.replace("_rev", "")
            if base_id in seen_edges:
                continue
            seen_edges.add(base_id)

            u_node = self.nodes.get(edge.u)
            v_node = self.nodes.get(edge.v)
            if not u_node or not v_node:
                continue

            coords = [[u_node.lon, u_node.lat]]
            for pt in edge.waypoints:
                coords.append([pt[1], pt[0]])
            coords.append([v_node.lon, v_node.lat])

            cost = self.calculate_edge_cost(edge)
            risk_pen = self.get_risk_penalty(edge.zone_id)

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords
                },
                "properties": {
                    "edge_id": edge.edge_id,
                    "road_name": edge.road_name,
                    "road_type": edge.road_type,
                    "distance_km": edge.distance_km,
                    "slope_deg": edge.slope_deg,
                    "zone_id": edge.zone_id,
                    "is_blocked": edge.is_blocked,
                    "blockage_reason": edge.blockage_reason,
                    "calculated_cost": "inf" if math.isinf(cost) else round(cost, 2),
                    "risk_penalty": round(risk_pen, 2)
                }
            })

        # 2. Nodes as Points
        for node in self.nodes.values():
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [node.lon, node.lat]
                },
                "properties": node.to_dict()
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }

    def get_weights_breakdown(self) -> List[Dict[str, Any]]:
        """Return a tabular breakdown of all edge weights for XAI inspection."""
        results = []
        seen = set()
        for edge in self.edges.values():
            base_id = edge.edge_id.replace("_rev", "")
            if base_id in seen:
                continue
            seen.add(base_id)

            cost = self.calculate_edge_cost(edge)
            risk_pen = self.get_risk_penalty(edge.zone_id)
            zone_info = self.zone_risks.get(edge.zone_id, {})

            results.append({
                "edge_id": edge.edge_id,
                "road_name": edge.road_name,
                "from_node": edge.u,
                "to_node": edge.v,
                "distance_km": edge.distance_km,
                "slope_deg": edge.slope_deg,
                "zone_id": edge.zone_id,
                "zone_risk_level": zone_info.get("risk_level", "Medium"),
                "zone_risk_score": zone_info.get("risk_score", 45.0),
                "risk_penalty": round(risk_pen, 2),
                "terrain_penalty": round(edge.slope_deg / 10.0, 2),
                "is_blocked": edge.is_blocked,
                "blockage_reason": edge.blockage_reason,
                "total_weight": "inf" if math.isinf(cost) else round(cost, 2)
            })

        return results

    def build_default_graph(self) -> None:
        """
        Build the default road graph topology for East Khasi Hills, Meghalaya.
        Covers 10 micro-zones, 5 shelters, 5 hospitals, 2 emergency centers, and 7 tourist hotspots.
        """
        # 1. Add Zone Centroid Nodes
        zones_data = [
            ("EKH-Z01", "Sohra (Cherrapunji) Plateau", 25.2750, 91.7320),
            ("EKH-Z02", "Mawsynram Valley & Ridge", 25.2980, 91.5830),
            ("EKH-Z03", "Shillong Bypass Cut-Slope Corridor", 25.6540, 91.9560),
            ("EKH-Z04", "Pynursla - Wah Umngot Valley", 25.3120, 91.9020),
            ("EKH-Z05", "Dawki Gorge & Border Ghats", 25.1850, 92.0190),
            ("EKH-Z06", "Laitkor Peak & Upper Shillong", 25.5520, 91.8680),
            ("EKH-Z07", "Elephant Falls Ravine Sector", 25.5360, 91.8260),
            ("EKH-Z08", "Cherra-Shella Limestone Ghats", 25.1950, 91.6420),
            ("EKH-Z09", "Mawphlang Sacred Valley", 25.4520, 91.7580),
            ("EKH-Z10", "Mawlynnong Eco-Valley", 25.2010, 91.9160)
        ]
        for z_code, z_name, lat, lon in zones_data:
            self.add_node(Node(
                node_id=z_code,
                name=z_name,
                node_type="zone_centroid",
                lat=lat,
                lon=lon,
                zone_id=z_code
            ))

        # 2. Add Safe Shelters
        shelters_data = [
            ("SHEL-01", "State Central Library Relief Shelter", 25.5750, 91.8840, "EKH-Z06", 1200, "1070"),
            ("SHEL-02", "Sohra Multi-Purpose Cyclone & Landslide Refuge", 25.2720, 91.7350, "EKH-Z01", 600, "+91-3637-264210"),
            ("SHEL-03", "Mawsynram Block Relief & Assembly Hall", 25.2950, 91.5810, "EKH-Z02", 450, "+91-3637-271020"),
            ("SHEL-04", "Pynursla Higher Secondary Evacuation Center", 25.3090, 91.9000, "EKH-Z04", 500, "+91-3637-282015"),
            ("SHEL-05", "Dawki Border Inspection & Emergency Refuge", 25.1880, 92.0150, "EKH-Z05", 350, "+91-3637-293010")
        ]
        for s_id, s_name, lat, lon, z_id, cap, contact in shelters_data:
            self.add_node(Node(
                node_id=s_id,
                name=s_name,
                node_type="shelter",
                lat=lat,
                lon=lon,
                zone_id=z_id,
                capacity=cap,
                contact=contact
            ))

        # 3. Add Hospitals & Trauma Centers
        hospitals_data = [
            ("HOSP-01", "NEIGRIHMS Tertiary Trauma Center", 25.5905, 91.9365, "EKH-Z03", 550, "+91-364-2538013"),
            ("HOSP-02", "Civil Hospital Shillong", 25.5714, 91.8785, "EKH-Z06", 350, "+91-364-2224100"),
            ("HOSP-03", "Sohra Community Health Centre (CHC)", 25.2785, 91.7280, "EKH-Z01", 50, "+91-3637-264210"),
            ("HOSP-04", "Mawsynram Primary Health Centre (PHC)", 25.3010, 91.5850, "EKH-Z02", 20, "+91-3637-271020"),
            ("HOSP-05", "Pynursla Community Health Centre", 25.3160, 91.9050, "EKH-Z04", 30, "+91-3637-282015")
        ]
        for h_id, h_name, lat, lon, z_id, cap, contact in hospitals_data:
            self.add_node(Node(
                node_id=h_id,
                name=h_name,
                node_type="hospital",
                lat=lat,
                lon=lon,
                zone_id=z_id,
                capacity=cap,
                contact=contact
            ))

        # 4. Add Tourist Hotspot Landmarks
        tourist_spots = [
            ("spot_nohkalikai", "Nohkalikai Falls (Sohra)", 25.2755, 91.6853, "EKH-Z01"),
            ("spot_sevensisters", "Seven Sisters Falls (Mawsmai)", 25.2505, 91.7214, "EKH-Z01"),
            ("spot_mawsynram", "Mawjymbuin Cave (Mawsynram)", 25.3130, 91.5830, "EKH-Z02"),
            ("spot_dawki", "Dawki Umngot River Ghats", 25.1870, 92.0190, "EKH-Z05"),
            ("spot_elephant", "Elephant Falls (Upper Shillong)", 25.5340, 91.8250, "EKH-Z07"),
            ("spot_laitlum", "Laitlum Canyons (Smit)", 25.4520, 91.9050, "EKH-Z04"),
            ("spot_shillong", "Shillong City Center (Police Bazar)", 25.5788, 91.8833, "EKH-Z06")
        ]
        for t_id, t_name, lat, lon, z_id in tourist_spots:
            self.add_node(Node(
                node_id=t_id,
                name=t_name,
                node_type="tourist_spot",
                lat=lat,
                lon=lon,
                zone_id=z_id
            ))

        # 5. Add Road Corridors & Arterial Highways (Edges)
        corridors = [
            # SH-5 Arterial Highway from Shillong down to Sohra Plateau
            ("E_SH5_01", "EKH-Z06", "EKH-Z07", "SH-5 (Upper Shillong Section)", "state_highway", 4.8, 22.0, "EKH-Z06",
             [[25.548, 91.855], [25.541, 91.842]]),
            ("E_SH5_02", "EKH-Z07", "EKH-Z09", "SH-5 (Elephant Falls to Mawphlang Junction)", "state_highway", 11.5, 26.0, "EKH-Z09",
             [[25.510, 91.805], [25.478, 91.772]]),
            ("E_SH5_03", "EKH-Z09", "EKH-Z01", "SH-5 (Mawphlang to Sohra High Plateau)", "state_highway", 21.4, 35.0, "EKH-Z01",
             [[25.410, 91.745], [25.350, 91.740], [25.305, 91.735]]),

            # Bypass & Local Link Roads around Sohra Plateau
            ("E_SOHRA_01", "EKH-Z01", "SHEL-02", "Sohra Shelter Access Road", "evacuation_corridor", 1.2, 14.0, "EKH-Z01",
             [[25.274, 25.274], [25.273, 91.734]]),
            ("E_SOHRA_02", "EKH-Z01", "HOSP-03", "Sohra CHC Health Link", "district_road", 1.8, 12.0, "EKH-Z01",
             [[25.276, 91.730], [25.278, 91.729]]),
            ("E_SOHRA_03", "spot_nohkalikai", "EKH-Z01", "Nohkalikai-Sohra Scenic Link", "district_road", 5.2, 34.0, "EKH-Z01",
             [[25.275, 91.700], [25.275, 91.718]]),
            ("E_SOHRA_04", "spot_sevensisters", "EKH-Z01", "Mawsmai Seven Sisters Rim Road", "district_road", 3.4, 31.0, "EKH-Z01",
             [[25.260, 91.725], [25.268, 91.730]]),
            ("E_SOHRA_05", "spot_nohkalikai", "SHEL-02", "Nohkalikai Direct Ridge Bypass", "evacuation_corridor", 5.6, 28.0, "EKH-Z01",
             [[25.272, 91.705], [25.271, 91.722]]),

            # Cherra-Shella Industrial Highway
            ("E_SHELLA_01", "EKH-Z01", "EKH-Z08", "Cherrapunji-Shella Ghat Road", "district_road", 14.2, 42.0, "EKH-Z08",
             [[25.240, 91.700], [25.215, 91.668]]),

            # Mawsynram Corridors
            ("E_MAWSYN_01", "EKH-Z09", "EKH-Z02", "SH-1 (Mawphlang-Mawsynram Highway)", "state_highway", 19.8, 32.0, "EKH-Z02",
             [[25.420, 91.710], [25.360, 91.645], [25.320, 91.605]]),
            ("E_MAWSYN_02", "EKH-Z02", "SHEL-03", "Mawsynram Block Safe Avenue", "evacuation_corridor", 0.9, 10.0, "EKH-Z02",
             [[25.296, 91.582]]),
            ("E_MAWSYN_03", "EKH-Z02", "HOSP-04", "Mawsynram PHC Route", "district_road", 1.1, 11.0, "EKH-Z02",
             [[25.300, 91.584]]),
            ("E_MAWSYN_04", "spot_mawsynram", "EKH-Z02", "Mawjymbuin Cave Access Track", "district_road", 1.8, 24.0, "EKH-Z02",
             [[25.308, 91.583]]),
            ("E_MAWSYN_05", "spot_mawsynram", "SHEL-03", "Mawjymbuin Ridge Emergency Bypass", "evacuation_corridor", 2.2, 18.0, "EKH-Z02",
             [[25.304, 91.582]]),

            # NH-206 South-Eastern Corridor: Shillong -> Laitlum -> Pynursla -> Mawlynnong -> Dawki
            ("E_NH206_01", "EKH-Z06", "spot_laitlum", "Smit-Laitlum Road", "district_road", 12.8, 25.0, "EKH-Z06",
             [[25.510, 91.880], [25.475, 91.895]]),
            ("E_NH206_02", "spot_laitlum", "EKH-Z04", "NH-206 (Laitlum Canyon to Pynursla)", "national_highway", 17.5, 33.0, "EKH-Z04",
             [[25.410, 91.903], [25.355, 91.902]]),
            ("E_NH206_03", "EKH-Z04", "SHEL-04", "Pynursla School Shelter Link", "evacuation_corridor", 0.7, 8.0, "EKH-Z04",
             [[25.310, 91.901]]),
            ("E_NH206_04", "EKH-Z04", "HOSP-05", "Pynursla CHC Hospital Track", "district_road", 0.9, 9.0, "EKH-Z04",
             [[25.314, 91.903]]),
            ("E_NH206_05", "EKH-Z04", "EKH-Z10", "Pynursla-Mawlynnong Link Road", "district_road", 14.5, 29.0, "EKH-Z10",
             [[25.260, 91.910], [25.220, 91.915]]),
            ("E_NH206_06", "EKH-Z10", "EKH-Z05", "NH-206 (Mawlynnong to Dawki Border)", "national_highway", 12.4, 38.0, "EKH-Z05",
             [[25.195, 91.960], [25.188, 91.995]]),
            ("E_NH206_07", "spot_dawki", "EKH-Z05", "Dawki Ghat Approach", "district_road", 0.5, 15.0, "EKH-Z05",
             [[25.186, 92.018]]),
            ("E_NH206_08", "spot_dawki", "SHEL-05", "Dawki Border Shelter Path", "evacuation_corridor", 0.8, 12.0, "EKH-Z05",
             [[25.187, 92.016]]),

            # Shillong Urban & Bypass Corridors (NH-6)
            ("E_NH6_01", "EKH-Z06", "spot_shillong", "Upper Shillong to Police Bazar", "state_highway", 3.8, 12.0, "EKH-Z06",
             [[25.565, 91.875]]),
            ("E_NH6_02", "spot_shillong", "SHEL-01", "Central Library Shelter Avenue", "evacuation_corridor", 0.6, 5.0, "EKH-Z06",
             [[25.576, 91.883]]),
            ("E_NH6_03", "spot_shillong", "HOSP-02", "Civil Hospital Shillong Avenue", "district_road", 1.1, 7.0, "EKH-Z06",
             [[25.574, 91.880]]),
            ("E_NH6_04", "spot_shillong", "EKH-Z03", "NH-6 (Shillong to NEIGRIHMS / Bypass)", "national_highway", 9.8, 20.0, "EKH-Z03",
             [[25.605, 91.915], [25.635, 91.940]]),
            ("E_NH6_05", "EKH-Z03", "HOSP-01", "NEIGRIHMS Trauma Center Corridor", "evacuation_corridor", 1.5, 10.0, "EKH-Z03",
             [[25.610, 91.945]]),

            # Inter-valley mountain link: Sohra (EKH-Z01) to Pynursla (EKH-Z04) via Wahkhen Bridge
            ("E_LINK_01", "EKH-Z01", "EKH-Z04", "Sohra-Pynursla Mountain Cross-Link", "district_road", 22.8, 36.0, "EKH-Z04",
             [[25.290, 91.780], [25.300, 91.840], [25.308, 91.880]]),

            # Tourist Spot Direct Connectors
            ("E_ELEPHANT_01", "spot_elephant", "EKH-Z07", "Elephant Falls Gate Road", "district_road", 0.4, 16.0, "EKH-Z07",
             [[25.535, 91.825]]),
            ("E_ELEPHANT_02", "spot_elephant", "HOSP-02", "Elephant Falls to Civil Hospital Emergency Link", "state_highway", 6.2, 14.0, "EKH-Z06",
             [[25.545, 91.845], [25.560, 91.865]])
        ]

        for e_id, u, v, road_name, road_type, dist, slope, z_id, waypoints in corridors:
            self.add_edge(Edge(
                edge_id=e_id,
                u=u,
                v=v,
                road_name=road_name,
                road_type=road_type,
                distance_km=dist,
                slope_deg=slope,
                zone_id=z_id,
                waypoints=waypoints
            ))


# Global Singleton EvacuationGraph instance
evacuation_graph = EvacuationGraph()
